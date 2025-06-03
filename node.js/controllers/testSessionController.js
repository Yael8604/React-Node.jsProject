const TestSession = require('../models/TestSession');
const UserAnswer = require('../models/Answer/answer');
const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');
const mongoose = require('mongoose');

// הגדרת חלקי הבחינה וזמניהם
// זוהי הגדרה סטטית לדוגמה. בפועל, ניתן לשלוף את זה ממסד נתונים או קונפיגורציה.
const EXAM_STRUCTURE = {
    psychotechnical: [
        { name: 'חשיבה מילולית', category: 'verbal_reasoning', timeLimitMinutes: 15, numQuestions: 20 },
        { name: 'חשיבה כמותית', category: 'numerical_reasoning', timeLimitMinutes: 20, numQuestions: 25 },
        { name: 'צורות', category: 'spatial_reasoning', timeLimitMinutes: 15, numQuestions: 20 },
        { name: 'הסקה לוגית', category: 'logical_reasoning', timeLimitMinutes: 10, numQuestions: 15 },
    ]
};

// פונקציית עזר לחישוב ציון לשאלה פסיכוטכנית
const calculatePsychotechnicalScore = async (questionId, userAnswerText) => { // שינוי שם פרמטר
    try {
        const question = await PsychotechnicalQuestion.findById(questionId);
        if (!question) {
            console.warn(`Question ${questionId} not found.`);
            return { isCorrect: false, score: 0 };
        }
        const isCorrect = question.correctAnswer === userAnswerText;
        const score = isCorrect ? 1 : 0;
        return { isCorrect, score };
    } catch (error) {
        console.error(`Error calculating score for question ${questionId}:`, error);
        return { isCorrect: false, score: 0 };
    }
};

// חדש: פונקציה להתחלת סשן בחינה - מומלץ ליצור סשן כאן ולקבל שאלות
exports.startPsychotechnicalExam = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }
    const userId = req.user._id;
    const testType = 'psychotechnical'; // קבוע לבחינה זו
    // בדוק אם יש סשן בחינה קיים במצב 'in_progress'
    let existingSession = await TestSession.findOne({ userId, testType, status: 'in_progress' });
    if (existingSession) {
        // אם קיים סשן, החזר אותו. זה מאפשר המשך בחינה במקרה של רענון/ניתוק.
        // נצטרך לשלוף את השאלות המלאות עבור ה-IDs ששמורים בסשן.
        const allQuestionIds = existingSession.sections.flatMap(s => s.questionIds);
        const questions = await PsychotechnicalQuestion.find({ _id: { $in: allQuestionIds } });

        // יש להרכיב מחדש את אובייקט ה-sections עם השאלות המלאות
        const sectionsWithQuestions = existingSession.sections.map(section => ({
            ...section.toObject(), // כדי להמיר את ה-Mongoose Document לאובייקט JS רגיל
            questions: questions.filter(q => section.questionIds.includes(q._id)),
        }));

        return res.status(200).json({
            message: 'Resuming existing exam session',
            sessionId: existingSession._id,
            sections: sectionsWithQuestions,
            currentSectionIndex: existingSession.currentSectionIndex,
            // נצטרך להחזיר גם את התשובות שכבר נשמרו כדי לשחזר מצב
            userAnswers: existingSession.answers, // זה רק IDים, צריך להחזיר את האובייקטים המלאים
        });
    }

    // בחר שאלות לכל חלק
    const sectionsToCreate = [];
    const allQuestionsForSession = []; // כל השאלות בסשן לפי הסדר

    for (const sectionConfig of EXAM_STRUCTURE.psychotechnical) {
        // בחר שאלות רנדומליות מקטגוריה זו.
        // בפועל, ניתן לבחור שאלות לפי רמת קושי או קריטריונים נוספים.
        const questionsForSection = await PsychotechnicalQuestion.aggregate([
            { $match: { category: sectionConfig.category } },
            { $sample: { size: sectionConfig.numQuestions } }
        ]);

        if (questionsForSection.length < sectionConfig.numQuestions) {
            console.warn(`Not enough questions for category ${sectionConfig.category}. Found ${questionsForSection.length}, needed ${sectionConfig.numQuestions}.`);
            // ניתן לטפל במקרה זה: לזרוק שגיאה, להחזיר פחות שאלות, וכו'.
        }

        sectionsToCreate.push({
            sectionName: sectionConfig.name,
            questionIds: questionsForSection.map(q => q._id),
            timeLimitSeconds: sectionConfig.timeLimitMinutes * 60,
        });
        allQuestionsForSession.push(...questionsForSection); // הוסף את אובייקטי השאלות המלאים
    }

    // צור סשן בחינה חדש
    const newSession = new TestSession({
        userId,
        testType,
        sections: sectionsToCreate,
        currentSectionIndex: 0,
        status: 'in_progress',
    });
    await newSession.save();

    res.status(200).json({
        message: 'Psychotechnical exam session started successfully',
        sessionId: newSession._id,
        sections: sectionsToCreate.map(s => ({
            ...s,
            questions: allQuestionsForSession.filter(q => s.questionIds.includes(q._id)) // החזר את השאלות המלאות
        })),
        currentSectionIndex: newSession.currentSectionIndex,
        userAnswers: {}, // סשן חדש, אין תשובות עדיין
    });
};

// שינוי: עדכון submitAnswers כדי לטפל ב-timeTaken ולעקוב אחר סשן
exports.submitAnswers = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId, questionId, answer, timeTaken, currentSectionIndex } = req.body; // קבל את כל הפרטים הרלוונטיים מהפרונטאנד

    if (!sessionId || !questionId || answer === undefined || timeTaken === undefined || currentSectionIndex === undefined) {
        return res.status(400).json({ message: 'Missing required fields for answer submission.' });
    }

    try {
        const testSession = await TestSession.findById(sessionId);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        // ודא שהמשתמש עונה על שאלה בחלק הנכון
        if (testSession.currentSectionIndex !== currentSectionIndex) {
            return res.status(400).json({ message: 'Attempting to answer question from wrong section.' });
        }
        const currentSection = testSession.sections[currentSectionIndex];
        if (!currentSection.questionIds.includes(new mongoose.Types.ObjectId(questionId))) {
             return res.status(400).json({ message: 'Question does not belong to current section.' });
        }


        // חשב ציון (בהנחה שזה פסיכוטכני)
        const { isCorrect, score } = await calculatePsychotechnicalScore(questionId, answer);

        // בדוק אם תשובה לשאלה זו כבר קיימת בסשן
        const existingUserAnswer = await UserAnswer.findOne({
            user: userId,
            questionId: questionId,
            _id: { $in: testSession.answers } // ודא שהיא חלק מהתשובות של הסשן הנוכחי
        });

        let newUserAnswer;
        if (existingUserAnswer) {
            // אם התשובה קיימת, עדכן אותה (למקרה של שינוי תשובה)
            existingUserAnswer.answer = answer;
            existingUserAnswer.timeTaken = timeTaken;
            existingUserAnswer.isCorrect = isCorrect;
            existingUserAnswer.score = score;
            await existingUserAnswer.save();
            newUserAnswer = existingUserAnswer;
        } else {
            // אם התשובה חדשה, צור אותה
            newUserAnswer = new UserAnswer({
                user: userId,
                questionId: questionId,
                questionType: testSession.testType, // שימוש בסוג המבחן של הסשן
                answer: answer,
                isCorrect: isCorrect,
                score: score,
                timeTaken: timeTaken
            });
            await newUserAnswer.save();
            testSession.answers.push(newUserAnswer._id); // הוסף את ה-ID לרשימת התשובות בסשן
        }

        // עדכן ציון גולמי בסשן
        const currentSectionScore = testSession.rawScores.get(currentSection.sectionName) || 0;
        testSession.rawScores.set(currentSection.sectionName, currentSectionScore + score);


        await testSession.save();

        res.status(200).json({
            message: 'Answer submitted successfully',
            userAnswerId: newUserAnswer._id,
            isCorrect: isCorrect,
            score: score,
        });

    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ message: 'Failed to submit answer', error: error.message });
    }
};

// חדש: סיום סשן בחינה
exports.endTestSession = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required.' });
    }

    try {
        const testSession = await TestSession.findById(sessionId);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        testSession.status = 'completed';
        testSession.endedAt = Date.now();

        // בפועל, כאן תתבצע הלוגיקה הסופית של חישוב הציון המשוקלל
        // וייתכן שתצטרך לשלוף את כל התשובות של הסשן כדי לחשב ציונים סופיים.
        // לצורך הדוגמה, נחזיר ציון כללי.
        // const totalScore = testSession.rawScores.get('psychotechnical') || 0; // או ציון משוקלל

        await testSession.save();

        res.status(200).json({
            message: 'Test session completed successfully',
            sessionId: testSession._id,
            // totalScore: totalScore, // תוכל להחזיר ציון סופי
        });

    } catch (error) {
        console.error('Error ending test session:', error);
        res.status(500).json({ message: 'Failed to end test session', error: error.message });
    }
};

// חדש: פונקציה למעבר לחלק הבא בבחינה
exports.moveToNextSection = async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    const userId = req.user._id;
    const { sessionId, nextSectionIndex } = req.body;

    if (!sessionId || nextSectionIndex === undefined) {
        return res.status(400).json({ message: 'Session ID and next section index are required.' });
    }

    try {
        const testSession = await TestSession.findById(sessionId);

        if (!testSession || testSession.userId.toString() !== userId.toString() || testSession.status !== 'in_progress') {
            return res.status(404).json({ message: 'Test session not found or not in progress.' });
        }

        if (nextSectionIndex >= testSession.sections.length) {
            return res.status(400).json({ message: 'Invalid section index or no more sections.' });
        }

        testSession.currentSectionIndex = nextSectionIndex;
        await testSession.save();

        res.status(200).json({
            message: 'Moved to next section successfully',
            newSectionIndex: testSession.currentSectionIndex,
        });

    } catch (error) {
        console.error('Error moving to next section:', error);
        res.status(500).json({ message: 'Failed to move to next section', error: error.message });
    }
};

// const Answer = require('../models/Answer/answer');
// const TestSession = require('../models/TestSession');
// const calculateZScore = require('../utils/calculateZScore');
// const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');

// //פונקצית הניתוח לא קראתי רק פשוט שמרתי כאן
// async function finalizeTestSession(userId, testSessionId, ageGroup) {
//   const answers = await Answer.find({ userId, testSessionId });

//   const resultsByAbility = {};
//   for (const answer of answers) {
//     const ability = answer.ability;
//     if (!resultsByAbility[ability]) {
//       resultsByAbility[ability] = { scoreSum: 0, count: 0 };
//     }
//     resultsByAbility[ability].scoreSum += answer.score || 0;
//     resultsByAbility[ability].count += 1;
//   }

//   const results = {};
//   for (const [ability, data] of Object.entries(resultsByAbility)) {
//     const avgScore = data.scoreSum / data.count;
//     const zScore = calculateZScore(avgScore, ability, ageGroup);

//     results[ability] = {
//       totalScore: avgScore,
//       zScore: zScore,
//       description: interpretZScore(zScore)
//     };
//   }

//   const session = await TestSession.findByIdAndUpdate(
//     testSessionId,
//     {
//       endedAt: new Date(),
//       answersCount: answers.length,
//       results
//     },
//     { new: true }
//   );

//   return session;
// }

// // תיאור מילולי לפי ציון תקן
// function interpretZScore(z) {
//   if (z > 1) return "יכולת גבוהה משמעותית מהממוצע.";
//   if (z > 0.5) return "יכולת מעל לממוצע.";
//   if (z > -0.5) return "יכולת בטווח הממוצע.";
//   if (z > -1) return "יכולת מעט מתחת לממוצע.";
//   return "יכולת נמוכה משמעותית מהממוצע.";
// }

// //  פונקציה להתחלת מבחן חדש -- לא עברתי עליה צריך לעבור עליה
// //  וליצור לה ניווט בקובץ הראוט וכן להשתמש בראוט הזה בקובץ הראשי
// exports.startTestSession = async (req, res) => {
//   try {
//     const { userId, testType } = req.body;

//     // בדיקה בסיסית
//     if (!userId || !testType) {
//       return res.status(400).json({ error: 'חסר userId או testType' });
//     }

//     // שליפת שאלות לפי סוג
//     let questions = [];

//     if (testType === 'psychotechnical') {
//       questions = await PsychotechnicalQuestion.aggregate([{ $sample: { size: 10 } }]);
//     } else {
//       // אם יש לך סוגים אחרים - להוסיף כאן בהתאם
//       return res.status(400).json({ error: 'testType לא נתמך' });
//     }

//     // יצירת סשן חדש ושמירת מזהי השאלות
//     const testSession = new TestSession({
//       userId,
//       testType,
//       questionIds: questions.map(q => q._id)
//     });

//     await testSession.save();

//     // מחזירים את הסשן + השאלות עצמן
//     res.status(201).json({
//       message: 'מבחן התחיל בהצלחה',
//       sessionId: testSession._id,
//       questions
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'שגיאה בהתחלת מבחן' });
//   }
// };

// //פונקציה שמעדכנת את התשובות בסשן של המבחן
// // testSessionController.js


// /**
//  * פונקציה לעדכון התשובות בסשן המבחן
//  * @param {Object} req - הבקשה שמכילה את התשובות
//  * @param {Object} res - התגובה שנחזור עליה למשתמש
//  */
// async function updateTestSession(req, res) {
//   try {
//     const { sessionId, answers } = req.body;  // לוקחים את מזהה הסשן ואת התשובות מהגוף של הבקשה
    
//     // נמצא את סשן המבחן לפי ה-sessionId
//     const testSession = await TestSession.findById(sessionId);
    
//     if (!testSession) {
//       return res.status(404).json({ message: 'Test session not found' });  // אם לא נמצא סשן, מחזירים שגיאה
//     }

//     // שומרים את התשובות החדשות בתשובות המשתמש (אפשר להוסיף אישור תשובות בתשובה כדי לשמור אותן)
//     const userAnswers = answers.map(answer => {
//       return {
//         questionId: answer.questionId,
//         userAnswer: answer.userAnswer,
//         correctAnswer: answer.correctAnswer,
//       };
//     });

//     // יוצרים אובייקטים של תשובות משתמש
//     const savedAnswers = await UserAnswer.insertMany(userAnswers);

//     // מעדכנים את הסשן בתשובות החדשות
//     testSession.answers = [...testSession.answers, ...savedAnswers.map(ans => ans._id)];
    
//     // מחשבים את התוצאות (לדוגמה - זה רק דוגמה, תוכל להוסיף חישוב לפי הצורך שלך)
//     const summary = calculateTestResults(testSession.answers);

//     // עדכון הסשן עם התוצאות החדשות
//     testSession.summary = summary;

//     // שומרים את הסשן המעודכן
//     await testSession.save();

//     return res.status(200).json({ message: 'Test session updated successfully', testSession });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// /**
//  * פונקציה לחישוב התוצאות של המבחן
//  * @param {Array} answers - מערך של תשובות
//  * @returns {Object} - סיכום התוצאות
//  */
// function calculateTestResults(answers) {
//   let totalScore = 0;
//   let zScore = 0;
//   let percentile = 0;
  
//   // חישוב הסיכום (הוספה לדוגמה, תוכל לשנות את החישוב)
//   answers.forEach(answer => {
//     if (answer.correctAnswer === answer.userAnswer) {
//       totalScore++;
//     }
//   });

//   // חישוב ז-score ו-percentile (זוהי רק דוגמה, תוכל לעדכן את החישוב בהתאם לצורך)
//   zScore = totalScore * 1.5;  // דוגמה לחישוב ז-score
//   percentile = (totalScore / answers.length) * 100;  // חישוב אחוזון

//   return {
//     totalScore,
//     zScore,
//     percentile,
//     description: `Score: ${totalScore} out of ${answers.length} questions`
//   };
// }

// module.exports = {
//   updateTestSession
// };

// module.exports = { finalizeTestSession};