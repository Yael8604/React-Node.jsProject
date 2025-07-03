const TestSession = require('../models/TestSession'); 

const UserAnswer = require('../models/Answer/answer');
const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');
const mongoose = require('mongoose');
const axios = require('axios');

// הגדרת חלקי הבחינה וזמניהם
const EXAM_STRUCTURE = {
    psychotechnical: [
        { name: 'חשיבה מילולית', category: 'verbal_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
        { name: 'חשיבה כמותית', category: 'numerical_reasoning', timeLimitMinutes: 3, numQuestions: 5 },
        { name: 'צורות', category: 'spatial_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
        { name: 'הסקה לוגית', category: 'logical_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
    ]
};

// פונקציית עזר לחישוב ציון לשאלה פסיכוטכנית
const calculatePsychotechnicalScore = async (questionId, userAnswerText) => {
    try {
        const question = await PsychotechnicalQuestion.findById(questionId);
        if (!question) {
            console.warn(`[calculateScore] Question ${questionId} not found.`);
            return { isCorrect: false, score: 0 };
        }
        const isCorrect = question.correctAnswer === userAnswerText;
        const score = isCorrect ? 1 : 0;
        return { isCorrect, score };
    } catch (error) {
        console.error(`[calculateScore] Error calculating score for question ${questionId}:`, error);
        return { isCorrect: false, score: 0 };
    }
};

// פונקציה להתחלת סשן בחינה
exports.startPsychotechnicalExam = async (req, res) => {
    if (!req.user || !req.user._id) {
        console.error('[startExam] Unauthorized attempt: User not logged in or req.user is missing.');
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }
    const userId = req.user._id;
    const testType = 'psychotechnical';

    console.log(`[startExam] Starting psychotechnical exam for userId: ${userId}`);

    let existingSession = await TestSession.findOne({ userId, testType, status: 'in_progress' });
    if (existingSession) {
        console.log(`[startExam] Resuming existing session ${existingSession._id} for user ${userId}.`);
        const allQuestionIds = existingSession.sections.flatMap(s => s.questionIds);
        const questions = await PsychotechnicalQuestion.find({ _id: { $in: allQuestionIds } });

        console.log(`[startExam] Found ${questions.length} questions for existing session from a total of ${allQuestionIds.length} IDs.`);

        const sectionsWithQuestions = existingSession.sections.map(section => ({
            ...section.toObject(),
            questions: questions.filter(q => section.questionIds.includes(q._id)),
        }));

        return res.status(200).json({
            message: 'Resuming existing exam session',
            sessionId: existingSession._id,
            sections: sectionsWithQuestions,
            currentSectionIndex: existingSession.currentSectionIndex,
            userAnswers: existingSession.answers,
        });
    }

    console.log(`[startExam] No existing session found. Creating new session for user: ${userId}`);

    const sectionsToCreate = [];
    const allQuestionsForSession = [];

    for (const sectionConfig of EXAM_STRUCTURE.psychotechnical) {
        console.log(`[startExam] Attempting to fetch ${sectionConfig.numQuestions} questions for category: '${sectionConfig.category}' (Section: '${sectionConfig.name}')`);

        const questionsForSection = await PsychotechnicalQuestion.aggregate([
            { $match: { category: sectionConfig.category } },
            { $sample: { size: sectionConfig.numQuestions } }
        ]);

        console.log(`[startExam] Found ${questionsForSection.length} questions for category '${sectionConfig.category}'.`);

        if (questionsForSection.length < sectionConfig.numQuestions) {
            console.warn(`[startExam] WARNING: Not enough questions for category ${sectionConfig.category}. Found ${questionsForSection.length}, needed ${sectionConfig.numQuestions}.`);
        }

        sectionsToCreate.push({
            sectionName: sectionConfig.name,
            questionIds: questionsForSection.map(q => q._id),
            timeLimitSeconds: sectionConfig.timeLimitMinutes * 60,
        });
        allQuestionsForSession.push(...questionsForSection);
    }

    console.log(`[startExam] Total questions collected across all sections: ${allQuestionsForSession.length}`);

    if (allQuestionsForSession.length === 0) {
        console.error('[startExam] CRITICAL ERROR: No questions were found for any section! This will likely cause issues on the frontend.');
        return res.status(400).json({ message: 'לא נמצאו שאלות כלל לבחינה. ודא שהמסד נתונים מאוכלס כהלכה ושהקטגוריות ב-EXAM_STRUCTURE תואמות.' });
    }

    const newSession = new TestSession({
        userId,
        testType,
        sections: sectionsToCreate,
        currentSectionIndex: 0,
        status: 'in_progress',
    });
    await newSession.save();

    console.log(`[startExam] New session ${newSession._id} saved successfully for user ${userId}.`);

    const responseSections = sectionsToCreate.map(s => ({
        ...s,
        questions: allQuestionsForSession.filter(q => s.questionIds.includes(q._id))
    }));

    res.status(200).json({
        message: 'Psychotechnical exam session started successfully',
        sessionId: newSession._id,
        sections: responseSections,
        currentSectionIndex: newSession.currentSectionIndex,
        userAnswers: {},
    });
};

exports.submitAnswers = async (req, res) => {
    if (!req.user || !req.user._id) {
        console.error('[submitAnswers] Unauthorized attempt: User not logged in or req.user is missing.');
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId, questionId, answer, timeTaken, currentSectionIndex } = req.body;

    console.log(`[submitAnswers] Received submission for session ${sessionId}, question ${questionId} by user ${userId}.`);

    if (!sessionId || !questionId || answer === undefined || timeTaken === undefined || currentSectionIndex === undefined) {
        console.error('[submitAnswers] Missing required fields in submission body.');
        return res.status(400).json({ message: 'Missing required fields for answer submission.' });
    }

    try {
        const testSession = await TestSession.findById(sessionId);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            console.warn(`[submitAnswers] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        if (testSession.currentSectionIndex !== currentSectionIndex) {
            console.warn(`[submitAnswers] User ${userId} attempting to answer question ${questionId} from wrong section. Expected: ${testSession.currentSectionIndex}, Got: ${currentSectionIndex}.`);
            return res.status(400).json({ message: 'Attempting to answer question from wrong section.' });
        }
        const currentSection = testSession.sections[currentSectionIndex];
        if (!currentSection.questionIds.includes(new mongoose.Types.ObjectId(questionId))) {
            console.warn(`[submitAnswers] Question ${questionId} does not belong to current section ${currentSection.sectionName}.`);
            return res.status(400).json({ message: 'Question does not belong to current section.' });
        }

        const { isCorrect, score } = await calculatePsychotechnicalScore(questionId, answer);
        console.log(`[submitAnswers] Question ${questionId} isCorrect: ${isCorrect}, Score: ${score}`);

        const existingUserAnswer = await UserAnswer.findOne({
            user: userId,
            questionId: questionId,
            _id: { $in: testSession.answers }
        });

        let newUserAnswer;



        if (existingUserAnswer) {
            console.log(`[submitAnswers] Updating existing answer for question ${questionId}.`);
            existingUserAnswer.answer = answer;
            existingUserAnswer.timeTaken = timeTaken;
            existingUserAnswer.isCorrect = isCorrect;
            existingUserAnswer.score = score;
            newUserAnswer = existingUserAnswer;
        } else {
            console.log(`[submitAnswers] Creating new answer for question ${questionId}.`);
            newUserAnswer = new UserAnswer({
            user: userId,
            questionId: questionId,
            questionType: testSession.testType,
            answer: answer,
            isCorrect: isCorrect,
            score: score,
            timeTaken: timeTaken
    });
    testSession.answers.push(newUserAnswer._id);
}

        // if (existingUserAnswer) {
        //     console.log(`[submitAnswers] Updating existing answer for question ${questionId}.`);
        //     existingUserAnswer.answer = answer;
        //     existingUserAnswer.timeTaken = timeTaken;
        //     existingUserAnswer.isCorrect = isCorrect;
        //     existingUserAnswer.score = score;
        //     existingUserAnswer.analysisResults = analysisResult; // עדכן את תוצאות הניתוח
        //     await existingUserAnswer.save();
        //     newUserAnswer = existingUserAnswer;
        // } else {
        //     console.log(`[submitAnswers] Creating new answer for question ${questionId}.`);
        //     newUserAnswer = new UserAnswer({
        //         user: userId,
        //         questionId: questionId,
        //         questionType: testSession.testType,
        //         answer: answer,
        //         isCorrect: isCorrect,
        //         score: score,
        //         timeTaken: timeTaken,
        //         analysisResults: analysisResult
        //     });
        //     await newUserAnswer.save();
        //     testSession.answers.push(newUserAnswer._id);
        // }

        const currentSectionScore = testSession.rawScores.get(currentSection.sectionName) || 0;
        testSession.rawScores.set(currentSection.sectionName, currentSectionScore + score);
        console.log(`[submitAnswers] Updated raw score for section '${currentSection.sectionName}' to: ${testSession.rawScores.get(currentSection.sectionName)}`);

        await testSession.save();
        console.log(`[submitAnswers] Test session ${sessionId} updated with answer ${newUserAnswer._id}.`);

        // try {
        //     console.log(`[submitAnswers] Calling Python analytics service for question ${questionId}.`);
        //     const pythonResponse = await axios.post('http://localhost:5000/analyze_response_time', {
        //         userId: userId.toString(),
        //         questionId: questionId.toString(),
        //         answer: answer,
        //         responseTime: timeTaken
        //     });

        //     const analysisResult = pythonResponse.data;
        //     console.log('[submitAnswers] Python analysis result:', analysisResult);

        //     return res.status(200).json({
        //         message: 'Answer submitted successfully and analyzed',
        //         userAnswerId: newUserAnswer._id,
        //         isCorrect: isCorrect,
        //         score: score,
        //         analysis: analysisResult,
        //         analysis: analysisResult // החזר את תוצאות הניתוח גם לפרונטאנד
        //     });

        // } catch (pythonError) {
        //     console.error('[submitAnswers] Error calling Python analytics service:', pythonError.message);
        //     return res.status(200).json({
        //         message: 'Answer submitted successfully, but analysis failed',
        //         userAnswerId: newUserAnswer._id,
        //         isCorrect: isCorrect,
        //         score: score,
        //         analysisError: pythonError.message
        //     });
        // }
        try {
    console.log(`[submitAnswers] Calling Python analytics service for question ${questionId}.`);
    const pythonResponse = await axios.post('http://localhost:5000/analyze_response_time', {
        userId: userId.toString(),
        questionId: questionId.toString(),
        answer: answer,
        responseTime: timeTaken
    });

    const analysisResult = pythonResponse.data;
    console.log('[submitAnswers] Python analysis result:', analysisResult);

    // עדכון של השדה לאחר קבלת הנתון מה-Python
    newUserAnswer.analysisResults = analysisResult;
    await newUserAnswer.save();

    await testSession.save();
    console.log(`[submitAnswers] Test session ${sessionId} updated with answer ${newUserAnswer._id}.`);

    return res.status(200).json({
        message: 'Answer submitted successfully and analyzed',
        userAnswerId: newUserAnswer._id,
        isCorrect: isCorrect,
        score: score,
        analysis: analysisResult
    });

} catch (pythonError) {
    console.error('[submitAnswers] Error calling Python analytics service:', pythonError.message);

    // שמירת התשובה גם אם אין ניתוח
    await newUserAnswer.save();
    await testSession.save();

    return res.status(200).json({
        message: 'Answer submitted successfully, but analysis failed',
        userAnswerId: newUserAnswer._id,
        isCorrect: isCorrect,
        score: score,
        analysisError: pythonError.message
    });
}






      

        return res.status(200).json({
            message: 'Answer submitted successfully (Python analysis skipped)',
            userAnswerId: newUserAnswer._id,
            isCorrect: isCorrect,
            score: score,
            analysis: null
        });

    } catch (error) {
        console.error('[submitAnswers] Error submitting answer:', error);
        res.status(500).json({ message: 'Failed to submit answer', error: error.message });
    }
};

exports.endTestSession = async (req, res) => {
    if (!req.user || !req.user._id) {
        console.error('[endTestSession] Unauthorized attempt: User not logged in or req.user is missing.');
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId } = req.body;

    console.log(`[endTestSession] Request to end session ${sessionId} by user ${userId}.`);

    if (!sessionId) {
        console.error('[endTestSession] Session ID is missing from request body.');
        return res.status(400).json({ message: 'Session ID is required.' });
    }

    try {
        const testSession = await TestSession.findById(sessionId);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            console.warn(`[endTestSession] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        testSession.status = 'completed';
        testSession.endedAt = Date.now();
        console.log(`[endTestSession] Session ${sessionId} status set to 'completed'.`);

        await testSession.save();
        console.log(`[endTestSession] Session ${sessionId} saved successfully as completed.`);

        res.status(200).json({
            message: 'Test session completed successfully',
            sessionId: testSession._id,
        });

    } catch (error) {
        console.error('[endTestSession] Error ending test session:', error);
        res.status(500).json({ message: 'Failed to end test session', error: error.message });
    }
};

exports.moveToNextSection = async (req, res) => {
    if (!req.user || !req.user._id) {
        console.error('[moveToNextSection] Unauthorized attempt: User not logged in or req.user is missing.');
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId, nextSectionIndex } = req.body;

    console.log(`[moveToNextSection] Request to move session ${sessionId} to section ${nextSectionIndex} by user ${userId}.`);

    if (!sessionId || nextSectionIndex === undefined) {
        console.error('[moveToNextSection] Session ID or next section index is missing from request body.');
        return res.status(400).json({ message: 'Session ID and next section index are required.' });
    }

    try {
        console.log('[moveToNextSection] Attempting to find test session...');
        const testSession = await TestSession.findById(sessionId);
        console.log('[moveToNextSection] Test session found:', !!testSession);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            console.warn(`[moveToNextSection] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        if (nextSectionIndex >= testSession.sections.length) {
            console.warn(`[moveToNextSection] Invalid section index: ${nextSectionIndex}. Total sections: ${testSession.sections.length}.`);
            return res.status(400).json({ message: 'Invalid section index or no more sections.' });
        }

        console.log(`[moveToNextSection] Updating currentSectionIndex to ${nextSectionIndex}...`);
        testSession.currentSectionIndex = nextSectionIndex;
        
        console.log('[moveToNextSection] Attempting to save test session...');
        await testSession.save();
        console.log(`[moveToNextSection] Session ${sessionId} successfully moved to section index: ${testSession.currentSectionIndex}.`);

        res.status(200).json({
            message: 'Moved to next section successfully',
            newSectionIndex: testSession.currentSectionIndex,
        });

    } catch (error) {
        console.error('[moveToNextSection] Error caught in try-catch block:', error);
        res.status(500).json({ message: 'Failed to move to next section', error: error.message });
    }
};

// ודאי שהגדרת המודל של TestSession נמצאת בקובץ נפרד
// לדוגמה, ב- C:\Users\user\Desktop\פרויקט\0\node.js\models\TestSession.js
// וודאי שהוא מייצא את המודל ככה: module.exports = mongoose.model('TestSession', TestSessionSchema);



// const TestSession = require('../models/TestSession');
// const UserAnswer = require('../models/Answer/answer');
// const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');
// const mongoose = require('mongoose');
// const axios = require('axios');

// // הגדרת חלקי הבחינה וזמניהם
// // זוהי הגדרה סטטית לדוגמה. בפועל, ניתן לשלוף את זה ממסד נתונים או קונפיגורציה.
// const EXAM_STRUCTURE = {
//     psychotechnical: [
//         { name: 'חשיבה מילולית', category: 'verbal_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
//         { name: 'חשיבה כמותית', category: 'numerical_reasoning', timeLimitMinutes: 3, numQuestions: 5 },
//         { name: 'צורות', category: 'spatial_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
//         { name: 'הסקה לוגית', category: 'logical_reasoning', timeLimitMinutes: 2, numQuestions: 5 },
//     ]
// };

// // פונקציית עזר לחישוב ציון לשאלה פסיכוטכנית
// const calculatePsychotechnicalScore = async (questionId, userAnswerText) => { // שינוי שם פרמטר
//     try {
//         const question = await PsychotechnicalQuestion.findById(questionId);
//         if (!question) {
//             console.warn(`[calculateScore] Question ${questionId} not found.`);
//             return { isCorrect: false, score: 0 };
//         }
//         const isCorrect = question.correctAnswer === userAnswerText;
//         const score = isCorrect ? 1 : 0;
//         return { isCorrect, score };
//     } catch (error) {
//         console.error(`[calculateScore] Error calculating score for question ${questionId}:`, error);
//         return { isCorrect: false, score: 0 };
//     }
// };

// // חדש: פונקציה להתחלת סשן בחינה - מומלץ ליצור סשן כאן ולקבל שאלות
// exports.startPsychotechnicalExam = async (req, res) => {
//     if (!req.user || !req.user._id) {
//         console.error('[startExam] Unauthorized attempt: User not logged in or req.user is missing.');
//         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
//     }
//     const userId = req.user._id;
//     const testType = 'psychotechnical'; // קבוע לבחינה זו

//     // הדפסה 1: נראה שהפונקציה התחילה וזיהתה משתמש
//     console.log(`[startExam] Starting psychotechnical exam for userId: ${userId}`);

//     // בדוק אם יש סשן בחינה קיים במצב 'in_progress'
//     let existingSession = await TestSession.findOne({ userId, testType, status: 'in_progress' });
//     if (existingSession) {
//         console.log(`[startExam] Resuming existing session ${existingSession._id} for user ${userId}.`);
//         // נצטרך לשלוף את השאלות המלאות עבור ה-IDs ששמורים בסשן.
//         const allQuestionIds = existingSession.sections.flatMap(s => s.questionIds);
//         const questions = await PsychotechnicalQuestion.find({ _id: { $in: allQuestionIds } });

//         // הדפסה 2: נראה כמה שאלות נשלפו עבור הסשן הקיים
//         console.log(`[startExam] Found ${questions.length} questions for existing session from a total of ${allQuestionIds.length} IDs.`);

//         // יש להרכיב מחדש את אובייקט ה-sections עם השאלות המלאות
//         const sectionsWithQuestions = existingSession.sections.map(section => ({
//             ...section.toObject(), // כדי להמיר את ה-Mongoose Document לאובייקט JS רגיל
//             questions: questions.filter(q => section.questionIds.includes(q._id)),
//         }));

//         // הדפסה 3: נראה את מבנה ה-sections לפני השליחה לפרונטאנד (עבור סשן קיים)
//         // שים לב: זה יכול להיות פלט ארוך מאוד אם יש הרבה שאלות, אז השתמש בזה בזהירות.
//         // console.log('[startExam] Sections for existing session (partial view):', JSON.stringify(sectionsWithQuestions.map(s => ({ name: s.sectionName, qCount: s.questions.length })), null, 2));


//         return res.status(200).json({
//             message: 'Resuming existing exam session',
//             sessionId: existingSession._id,
//             sections: sectionsWithQuestions,
//             currentSectionIndex: existingSession.currentSectionIndex,
//             // נצטרך להחזיר גם את התשובות שכבר נשמרו כדי לשחזר מצב
//             userAnswers: existingSession.answers, // זה רק IDים, צריך להחזיר את האובייקטים המלאים
//         });
//     }

//     // אם אין סשן קיים, ממשיכים ליצור חדש.
//     console.log(`[startExam] No existing session found. Creating new session for user: ${userId}`);

//     // בחר שאלות לכל חלק
//     const sectionsToCreate = [];
//     const allQuestionsForSession = []; // כל השאלות בסשן לפי הסדר

//     for (const sectionConfig of EXAM_STRUCTURE.psychotechnical) {
//         // הדפסה 4: לפני שליפת השאלות עבור קטגוריה ספציפית
//         console.log(`[startExam] Attempting to fetch ${sectionConfig.numQuestions} questions for category: '${sectionConfig.category}' (Section: '${sectionConfig.name}')`);

//         const questionsForSection = await PsychotechnicalQuestion.aggregate([
//             { $match: { category: sectionConfig.category } },
//             { $sample: { size: sectionConfig.numQuestions } }
//         ]);

//         // הדפסה 5: אחרי שליפת השאלות, כמה בפועל נמצאו
//         console.log(`[startExam] Found ${questionsForSection.length} questions for category '${sectionConfig.category}'.`);

//         if (questionsForSection.length < sectionConfig.numQuestions) {
//             // הדפסה 6: אזהרה אם לא נמצאו מספיק שאלות
//             console.warn(`[startExam] WARNING: Not enough questions for category ${sectionConfig.category}. Found ${questionsForSection.length}, needed ${sectionConfig.numQuestions}.`);
//             // אנו לא זורקים כאן שגיאה, אבל כדאי לזכור שאם קטגוריה חסרה לגמרי, זה יכול לגרום לבעיות בפרונטאנד.
//             // אם תרצה שהבחינה תיכשל במקרה של חוסר שאלות, הסר את ההערה משורת הקוד הבאה:
//             // return res.status(400).json({ message: `Not enough questions for category: ${sectionConfig.name}` });
//         }

//         sectionsToCreate.push({
//             sectionName: sectionConfig.name,
//             questionIds: questionsForSection.map(q => q._id),
//             timeLimitSeconds: sectionConfig.timeLimitMinutes * 60,
//         });
//         allQuestionsForSession.push(...questionsForSection); // הוסף את אובייקטי השאלות המלאים
//     }

//     // הדפסה 7: נראה כמה שאלות בסך הכל נאספו מכל הסקשנים
//     console.log(`[startExam] Total questions collected across all sections: ${allQuestionsForSession.length}`);

//     // בדיקה קריטית: אם לא נמצאו שאלות כלל
//     if (allQuestionsForSession.length === 0) {
//         console.error('[startExam] CRITICAL ERROR: No questions were found for any section! This will likely cause issues on the frontend.');
//         return res.status(400).json({ message: 'לא נמצאו שאלות כלל לבחינה. ודא שהמסד נתונים מאוכלס כהלכה ושהקטגוריות ב-EXAM_STRUCTURE תואמות.' });
//     }

//     // צור סשן בחינה חדש
//     const newSession = new TestSession({
//         userId,
//         testType,
//         sections: sectionsToCreate,
//         currentSectionIndex: 0,
//         status: 'in_progress',
//     });
//     await newSession.save();

//     // הדפסה 8: סשן נשמר בהצלחה
//     console.log(`[startExam] New session ${newSession._id} saved successfully for user ${userId}.`);

//     // מרכיבים את התגובה הסופית עם השאלות המלאות
//     const responseSections = sectionsToCreate.map(s => ({
//         ...s,
//         questions: allQuestionsForSession.filter(q => s.questionIds.includes(q._id)) // החזר את השאלות המלאות
//     }));

//     // הדפסה 9: נראה את מבנה ה-sections הסופי לפני השליחה לפרונטאנד
//     // שים לב: זה יכול להיות פלט ארוך מאוד, אז השתמש בזה בזהירות.
//     // console.log('[startExam] Final response sections (partial view):', JSON.stringify(responseSections.map(s => ({ name: s.sectionName, qCount: s.questions.length })), null, 2));


//     res.status(200).json({
//         message: 'Psychotechnical exam session started successfully',
//         sessionId: newSession._id,
//         sections: responseSections,
//         currentSectionIndex: newSession.currentSectionIndex,
//         userAnswers: {}, // סשן חדש, אין תשובות עדיין
//     });
// };

// // ---

// // שינוי: עדכון submitAnswers כדי לטפל ב-timeTaken ולעקוב אחר סשן
// exports.submitAnswers = async (req, res) => {
//     if (!req.user || !req.user._id) {
//         console.error('[submitAnswers] Unauthorized attempt: User not logged in or req.user is missing.');
//         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
//     }

//     const userId = req.user._id;
//     const { sessionId, questionId, answer, timeTaken, currentSectionIndex } = req.body;

//     console.log(`[submitAnswers] Received submission for session ${sessionId}, question ${questionId} by user ${userId}.`);

//     if (!sessionId || !questionId || answer === undefined || timeTaken === undefined || currentSectionIndex === undefined) {
//         console.error('[submitAnswers] Missing required fields in submission body.');
//         return res.status(400).json({ message: 'Missing required fields for answer submission.' });
//     }

//     try {
//         const testSession = await TestSession.findById(sessionId);

//         if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
//             console.warn(`[submitAnswers] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
//             return res.status(404).json({ message: 'Test session not found or not in progress.' });
//         }

//         // ודא שהמשתמש עונה על שאלה בחלק הנכון
//         if (testSession.currentSectionIndex !== currentSectionIndex) {
//             console.warn(`[submitAnswers] User ${userId} attempting to answer question ${questionId} from wrong section. Expected: ${testSession.currentSectionIndex}, Got: ${currentSectionIndex}.`);
//             return res.status(400).json({ message: 'Attempting to answer question from wrong section.' });
//         }
//         const currentSection = testSession.sections[currentSectionIndex];
//         if (!currentSection.questionIds.includes(new mongoose.Types.ObjectId(questionId))) {
//             console.warn(`[submitAnswers] Question ${questionId} does not belong to current section ${currentSection.sectionName}.`);
//             return res.status(400).json({ message: 'Question does not belong to current section.' });
//         }

//         // חשב ציון (בהנחה שזה פסיכוטכני)
//         const { isCorrect, score } = await calculatePsychotechnicalScore(questionId, answer);
//         console.log(`[submitAnswers] Question ${questionId} isCorrect: ${isCorrect}, Score: ${score}`);

//         // בדוק אם תשובה לשאלה זו כבר קיימת בסשן
//         const existingUserAnswer = await UserAnswer.findOne({
//             user: userId,
//             questionId: questionId,
//             _id: { $in: testSession.answers } // ודא שהיא חלק מהתשובות של הסשן הנוכחי
//         });

//         let newUserAnswer;
//         if (existingUserAnswer) {
//             console.log(`[submitAnswers] Updating existing answer for question ${questionId}.`);
//             // אם התשובה קיימת, עדכן אותה (למקרה של שינוי תשובה)
//             existingUserAnswer.answer = answer;
//             existingUserAnswer.timeTaken = timeTaken;
//             existingUserAnswer.isCorrect = isCorrect;
//             existingUserAnswer.score = score;
//             await existingUserAnswer.save();
//             newUserAnswer = existingUserAnswer;
//         } else {
//             console.log(`[submitAnswers] Creating new answer for question ${questionId}.`);
//             // אם התשובה חדשה, צור אותה
//             newUserAnswer = new UserAnswer({
//                 user: userId,
//                 questionId: questionId,
//                 questionType: testSession.testType, // שימוש בסוג המבחן של הסשן
//                 answer: answer,
//                 isCorrect: isCorrect,
//                 score: score,
//                 timeTaken: timeTaken
//             });
//             await newUserAnswer.save();
//             testSession.answers.push(newUserAnswer._id); // הוסף את ה-ID לרשימת התשובות בסשן
//         }

//         // עדכן ציון גולמי בסשן
//         const currentSectionScore = testSession.rawScores.get(currentSection.sectionName) || 0;
//         testSession.rawScores.set(currentSection.sectionName, currentSectionScore + score);
//         console.log(`[submitAnswers] Updated raw score for section '${currentSection.sectionName}' to: ${testSession.rawScores.get(currentSection.sectionName)}`);

//         await testSession.save();
//         console.log(`[submitAnswers] Test session ${sessionId} updated with answer ${newUserAnswer._id}.`);


//         try {
//             console.log(`[submitAnswers] Calling Python analytics service for question ${questionId}.`);
//             const pythonResponse = await axios.post('http://localhost:5000/analyze_response_time', {
//                 userId: userId.toString(),
//                 questionId: questionId.toString(),
//                 answer: answer,
//                 responseTime: timeTaken
//             });

//             const analysisResult = pythonResponse.data;
//             console.log('[submitAnswers] Python analysis result:', analysisResult);

//             return res.status(200).json({
//                 message: 'Answer submitted successfully and analyzed',
//                 userAnswerId: newUserAnswer._id,
//                 isCorrect: isCorrect,
//                 score: score,
//                 analysis: analysisResult
//             });

//         } catch (pythonError) {
//             console.error('[submitAnswers] Error calling Python analytics service:', pythonError.message);
//             // נחזיר 200 גם אם שירות הפייתון נכשל, כדי לא לחסום את התקדמות הבחינה.
//             return res.status(200).json({
//                 message: 'Answer submitted successfully, but analysis failed',
//                 userAnswerId: newUserAnswer._id,
//                 isCorrect: isCorrect,
//                 score: score,
//                 analysisError: pythonError.message
//             });
//         }

//     } catch (error) {
//         console.error('[submitAnswers] Error submitting answer:', error);
//         res.status(500).json({ message: 'Failed to submit answer', error: error.message });
//     }
// };

// // ---

// // חדש: סיום סשן בחינה
// exports.endTestSession = async (req, res) => {
//     if (!req.user || !req.user._id) {
//         console.error('[endTestSession] Unauthorized attempt: User not logged in or req.user is missing.');
//         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
//     }

//     const userId = req.user._id;
//     const { sessionId } = req.body;

//     console.log(`[endTestSession] Request to end session ${sessionId} by user ${userId}.`);

//     if (!sessionId) {
//         console.error('[endTestSession] Session ID is missing from request body.');
//         return res.status(400).json({ message: 'Session ID is required.' });
//     }

//     try {
//         const testSession = await TestSession.findById(sessionId);

//         if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
//             console.warn(`[endTestSession] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
//             return res.status(404).json({ message: 'Test session not found or not in progress.' });
//         }

//         testSession.status = 'completed';
//         testSession.endedAt = Date.now();
//         console.log(`[endTestSession] Session ${sessionId} status set to 'completed'.`);

//         // בפועל, כאן תתבצע הלוגיקה הסופית של חישוב הציון המשוקלל
//         // וייתכן שתצטרך לשלוף את כל התשובות של הסשן כדי לחשב ציונים סופיים.
//         // לצורך הדוגמה, נחזיר ציון כללי.
//         // const totalScore = testSession.rawScores.get('psychotechnical') || 0; // או ציון משוקלל

//         await testSession.save();
//         console.log(`[endTestSession] Session ${sessionId} saved successfully as completed.`);


//         res.status(200).json({
//             message: 'Test session completed successfully',
//             sessionId: testSession._id,
//             // totalScore: totalScore, // תוכל להחזיר ציון סופי
//         });

//     } catch (error) {
//         console.error('[endTestSession] Error ending test session:', error);
//         res.status(500).json({ message: 'Failed to end test session', error: error.message });
//     }
// };

// // ---

// // // חדש: פונקציה למעבר לחלק הבא בבחינה
// // exports.moveToNextSection = async (req, res) => {
// //     if (!req.user || !req.user._id) {
// //         console.error('[moveToNextSection] Unauthorized attempt: User not logged in or req.user is missing.');
// //         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
// //     }

// //     const userId = req.user._id;
// //     const { sessionId, nextSectionIndex } = req.body;

// //     console.log(`[moveToNextSection] Request to move session ${sessionId} to section ${nextSectionIndex} by user ${userId}.`);

// //     if (!sessionId || nextSectionIndex === undefined) {
// //         console.error('[moveToNextSection] Session ID or next section index is missing from request body.');
// //         return res.status(400).json({ message: 'Session ID and next section index are required.' });
// //     }

// //     try {
// //         const testSession = await TestSession.findById(sessionId);

// //         if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
// //             console.warn(`[moveToNextSection] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
// //             return res.status(404).json({ message: 'Test session not found or not in progress.' });
// //         }

// //         if (nextSectionIndex >= testSession.sections.length) {
// //             console.warn(`[moveToNextSection] Invalid section index: ${nextSectionIndex}. Total sections: ${testSession.sections.length}.`);
// //             return res.status(400).json({ message: 'Invalid section index or no more sections.' });
// //         }

// //         testSession.currentSectionIndex = nextSectionIndex;
// //         await testSession.save();
// //         console.log(`[moveToNextSection] Session ${sessionId} successfully moved to section index: ${testSession.currentSectionIndex}.`);


// //         res.status(200).json({
// //             message: 'Moved to next section successfully',
// //             newSectionIndex: testSession.currentSectionIndex,
// //         });

// //     } catch (error) {
// //         console.error('[moveToNextSection] Error moving to next section:', error);
// //         res.status(500).json({ message: 'Failed to move to next section', error: error.message });
// //     }
// // };

// exports.moveToNextSection = async (req, res) => {
//     if (!req.user || !req.user._id) {
//         console.error('[moveToNextSection] Unauthorized attempt: User not logged in or req.user is missing.');
//         return res.status(401).json({ message: 'Unauthorized: User not logged in' });
//     }

//     const userId = req.user._id;
//     const { sessionId, nextSectionIndex } = req.body;

//     console.log(`[moveToNextSection] Request to move session ${sessionId} to section ${nextSectionIndex} by user ${userId}.`);

//     if (!sessionId || nextSectionIndex === undefined) {
//         console.error('[moveToNextSection] Session ID or next section index is missing from request body.');
//         return res.status(400).json({ message: 'Session ID and next section index are required.' });
//     }

//     try {
//         console.log('[moveToNextSection] Attempting to find test session...');
//         const testSession = await TestSession.findById(sessionId);
//         console.log('[moveToNextSection] Test session found:', !!testSession);

//         if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
//             console.warn(`[moveToNextSection] Test session ${sessionId} not found, not in progress, or user mismatch for user ${userId}.`);
//             return res.status(404).json({ message: 'Test session not found or not in progress.' });
//         }

//         if (nextSectionIndex >= testSession.sections.length) {
//             console.warn(`[moveToNextSection] Invalid section index: ${nextSectionIndex}. Total sections: ${testSession.sections.length}.`);
//             return res.status(400).json({ message: 'Invalid section index or no more sections.' });
//         }

//         console.log(`[moveToNextSection] Updating currentSectionIndex to ${nextSectionIndex}...`);
//         testSession.currentSectionIndex = nextSectionIndex;
        
//         console.log('[moveToNextSection] Attempting to save test session...');
//         await testSession.save(); // <-- שימי לב במיוחד לשורה הזו
//         console.log(`[moveToNextSection] Session ${sessionId} successfully moved to section index: ${testSession.currentSectionIndex}.`);

//         res.status(200).json({
//             message: 'Moved to next section successfully',
//             newSectionIndex: testSession.currentSectionIndex,
//         });

//     } catch (error) {
//         console.error('[moveToNextSection] Error caught in try-catch block:', error); // הדפיסי את האובייקט error המלא
//         res.status(500).json({ message: 'Failed to move to next section', error: error.message });
//     }
// };