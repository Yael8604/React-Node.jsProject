const Answer = require('../models/Answer/answer');
const TestSession = require('../models/TestSession');
const calculateZScore = require('../utils/calculateZScore');
const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');

//פונקצית הניתוח לא קראתי רק פשוט שמרתי כאן
async function finalizeTestSession(userId, testSessionId, ageGroup) {
  const answers = await Answer.find({ userId, testSessionId });

  const resultsByAbility = {};
  for (const answer of answers) {
    const ability = answer.ability;
    if (!resultsByAbility[ability]) {
      resultsByAbility[ability] = { scoreSum: 0, count: 0 };
    }
    resultsByAbility[ability].scoreSum += answer.score || 0;
    resultsByAbility[ability].count += 1;
  }

  const results = {};
  for (const [ability, data] of Object.entries(resultsByAbility)) {
    const avgScore = data.scoreSum / data.count;
    const zScore = calculateZScore(avgScore, ability, ageGroup);

    results[ability] = {
      totalScore: avgScore,
      zScore: zScore,
      description: interpretZScore(zScore)
    };
  }

  const session = await TestSession.findByIdAndUpdate(
    testSessionId,
    {
      endedAt: new Date(),
      answersCount: answers.length,
      results
    },
    { new: true }
  );

  return session;
}

// תיאור מילולי לפי ציון תקן
function interpretZScore(z) {
  if (z > 1) return "יכולת גבוהה משמעותית מהממוצע.";
  if (z > 0.5) return "יכולת מעל לממוצע.";
  if (z > -0.5) return "יכולת בטווח הממוצע.";
  if (z > -1) return "יכולת מעט מתחת לממוצע.";
  return "יכולת נמוכה משמעותית מהממוצע.";
}

//  פונקציה להתחלת מבחן חדש -- לא עברתי עליה צריך לעבור עליה
//  וליצור לה ניווט בקובץ הראוט וכן להשתמש בראוט הזה בקובץ הראשי
exports.startTestSession = async (req, res) => {
  try {
    const { userId, testType } = req.body;

    // בדיקה בסיסית
    if (!userId || !testType) {
      return res.status(400).json({ error: 'חסר userId או testType' });
    }

    // שליפת שאלות לפי סוג
    let questions = [];

    if (testType === 'psychotechnical') {
      questions = await PsychotechnicalQuestion.aggregate([{ $sample: { size: 10 } }]);
    } else {
      // אם יש לך סוגים אחרים - להוסיף כאן בהתאם
      return res.status(400).json({ error: 'testType לא נתמך' });
    }

    // יצירת סשן חדש ושמירת מזהי השאלות
    const testSession = new TestSession({
      userId,
      testType,
      questionIds: questions.map(q => q._id)
    });

    await testSession.save();

    // מחזירים את הסשן + השאלות עצמן
    res.status(201).json({
      message: 'מבחן התחיל בהצלחה',
      sessionId: testSession._id,
      questions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בהתחלת מבחן' });
  }
};

//פונקציה שמעדכנת את התשובות בסשן של המבחן
// testSessionController.js


/**
 * פונקציה לעדכון התשובות בסשן המבחן
 * @param {Object} req - הבקשה שמכילה את התשובות
 * @param {Object} res - התגובה שנחזור עליה למשתמש
 */
async function updateTestSession(req, res) {
  try {
    const { sessionId, answers } = req.body;  // לוקחים את מזהה הסשן ואת התשובות מהגוף של הבקשה
    
    // נמצא את סשן המבחן לפי ה-sessionId
    const testSession = await TestSession.findById(sessionId);
    
    if (!testSession) {
      return res.status(404).json({ message: 'Test session not found' });  // אם לא נמצא סשן, מחזירים שגיאה
    }

    // שומרים את התשובות החדשות בתשובות המשתמש (אפשר להוסיף אישור תשובות בתשובה כדי לשמור אותן)
    const userAnswers = answers.map(answer => {
      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
      };
    });

    // יוצרים אובייקטים של תשובות משתמש
    const savedAnswers = await UserAnswer.insertMany(userAnswers);

    // מעדכנים את הסשן בתשובות החדשות
    testSession.answers = [...testSession.answers, ...savedAnswers.map(ans => ans._id)];
    
    // מחשבים את התוצאות (לדוגמה - זה רק דוגמה, תוכל להוסיף חישוב לפי הצורך שלך)
    const summary = calculateTestResults(testSession.answers);

    // עדכון הסשן עם התוצאות החדשות
    testSession.summary = summary;

    // שומרים את הסשן המעודכן
    await testSession.save();

    return res.status(200).json({ message: 'Test session updated successfully', testSession });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * פונקציה לחישוב התוצאות של המבחן
 * @param {Array} answers - מערך של תשובות
 * @returns {Object} - סיכום התוצאות
 */
function calculateTestResults(answers) {
  let totalScore = 0;
  let zScore = 0;
  let percentile = 0;
  
  // חישוב הסיכום (הוספה לדוגמה, תוכל לשנות את החישוב)
  answers.forEach(answer => {
    if (answer.correctAnswer === answer.userAnswer) {
      totalScore++;
    }
  });

  // חישוב ז-score ו-percentile (זוהי רק דוגמה, תוכל לעדכן את החישוב בהתאם לצורך)
  zScore = totalScore * 1.5;  // דוגמה לחישוב ז-score
  percentile = (totalScore / answers.length) * 100;  // חישוב אחוזון

  return {
    totalScore,
    zScore,
    percentile,
    description: `Score: ${totalScore} out of ${answers.length} questions`
  };
}

module.exports = {
  updateTestSession
};

module.exports = { finalizeTestSession};


//השליחה לשרת בסיום המבחן תיראה בערך כך:
// POST /api/testSessions/finalize
// body: {
//   userId,
//   testSessionId,
//   ageGroup: "30-39"
// }



// // src/controllers/testSessionController.js
// const TestSession = require('../models/TestSession');
// const PsychotechnicalQuestion = require('../models/PsychotechnicalQuestion');
// const PersonalityQuestion = require('../models/PersonalityQuestion');
// const User = require('../models/User'); // נצטרך את מודל המשתמש

// // פונקציית עזר לבחירת שאלה הבאה במבחן אדפטיבי פשוט
// // **הערה**: זוהי לוגיקה פשוטה. יישום IRT מלא דורש אלגוריתמים מורכבים יותר וקליברציה.
// async function getNextQuestion(testSession) {
//     const { currentQuestionType, currentQuestionIndex, psychotechnicalQuestions, personalityQuestions, answers } = testSession;

//     let nextQuestionId;
//     let nextQuestionData;

//     // בחר את השאלה הבאה לפי סוג המבחן והאינדקס הנוכחי
//     if (currentQuestionType === 'psychotechnical') {
//         if (currentQuestionIndex < psychotechnicalQuestions.length) {
//             nextQuestionId = psychotechnicalQuestions[currentQuestionIndex];
//             nextQuestionData = await PsychotechnicalQuestion.findById(nextQuestionId);
//         } else {
//             // אם סיימנו את השאלות הפסיכוטכניות, עבור לאישיותיות (אם יש)
//             if (personalityQuestions && personalityQuestions.length > 0) {
//                 testSession.currentQuestionType = 'personality';
//                 testSession.currentQuestionIndex = 0; // אתחל את האינדקס לסוג השאלה החדש
//                 await testSession.save(); // שמור את השינוי בסטטוס
//                 return getNextQuestion(testSession); // קרא שוב כדי לקבל את השאלה האישיותית הראשונה
//             }
//             return null; // אין עוד שאלות
//         }
//     } else if (currentQuestionType === 'personality') {
//         if (currentQuestionIndex < personalityQuestions.length) {
//             nextQuestionId = personalityQuestions[currentQuestionIndex];
//             nextQuestionData = await PersonalityQuestion.findById(nextQuestionId);
//         } else {
//             return null; // אין עוד שאלות
//         }
//     } else {
//         return null; // סוג שאלה לא מוכר
//     }

//     if (nextQuestionData) {
//         // הסתר את התשובה הנכונה לפני שליחה ללקוח
//         const questionToSend = nextQuestionData.toObject();
//         delete questionToSend.correctAnswer;
//         delete questionToSend.irt_a;
//         delete questionToSend.irt_b;
//         delete questionToSend.irt_c;
//         delete questionToSend.direction; // הסתר גם את ה-direction לשאלות אישיותיות, הלקוח לא צריך לדעת

//         return questionToSend;
//     }

//     return null; // לא נמצאה שאלה
// }


// // פונקציית עזר לחישוב ציוני תקן ואחוזונים
// // **הערה**: אלו פונקציות דמה. במערכת אמיתית, היית משתמש בנתונים נורמטיביים אמיתיים.
// const calculateZScore = (score, mean, stdDev) => {
//     if (stdDev === 0) return 0;
//     return (score - mean) / stdDev;
// };

// const calculatePercentile = (zScore) => {
//     // פונקציית CDF (Cumulative Distribution Function) של התפלגות נורמלית
//     // ניתן להשתמש בספרייה כמו 'jStat' או לממש קירוב
//     // לצורך הדוגמה, נחזיר ערך רנדומלי או קבוע
//     if (zScore > 2) return 99;
//     if (zScore < -2) return 1;
//     return 50 + (zScore * 10); // קירוב פשוט לדוגמה
// };


// // 1. התחלת סשן מבחן
// exports.startTestSession = async (req, res) => {
//     try {
//         const userId = req.user.id; // מזהה המשתמש מתוך ה-JWT

//         // ודא שלמשתמש אין סשן מבחן פעיל
//         const existingSession = await TestSession.findOne({ user: userId, status: 'in_progress' });
//         if (existingSession) {
//             return res.status(400).json({ message: 'למשתמש קיים סשן מבחן פעיל. אנא סיים אותו או בטל.' });
//         }

//         // לוגיקה לבחירת שאלות:
//         // בשלב זה, נבחר שאלות באופן אקראי, אך זה המקום בו תבצע את הבחירה האדפטיבית
//         // לדוגמה: 15 שאלות פסיכוטכניות, 10 שאלות אישיותיות
//         const psychotechnicalQuestions = await PsychotechnicalQuestion.aggregate([{ $sample: { size: 15 } }]);
//         const personalityQuestions = await PersonalityQuestion.aggregate([{ $sample: { size: 10 } }]);

//         // צור סשן מבחן חדש
//         const newSession = new TestSession({
//             user: userId,
//             psychotechnicalQuestions: psychotechnicalQuestions.map(q => q._id),
//             personalityQuestions: personalityQuestions.map(q => q._id),
//             status: 'in_progress',
//             currentQuestionIndex: 0,
//             currentQuestionType: 'psychotechnical', // התחל תמיד עם פסיכוטכני
//         });
//         await newSession.save();

//         // שלוף את השאלה הראשונה לשליחה ללקוח
//         const firstQuestion = await getNextQuestion(newSession);

//         if (!firstQuestion) {
//             return res.status(500).json({ message: 'לא ניתן למצוא שאלות למבחן.' });
//         }

//         res.status(201).json({
//             message: 'סשן מבחן הותחל בהצלחה',
//             sessionId: newSession._id,
//             question: firstQuestion, // השאלה הראשונה
//             currentQuestionIndex: newSession.currentQuestionIndex,
//             currentQuestionType: newSession.currentQuestionType,
//             totalQuestions: psychotechnicalQuestions.length + personalityQuestions.length // סך כל השאלות
//         });

//     } catch (error) {
//         console.error('Error starting test session:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בהתחלת סשן מבחן', error: error.message });
//     }
// };

// // 2. שליחת תשובה וקבלת השאלה הבאה
// exports.submitAnswer = async (req, res) => {
//     try {
//         const { sessionId } = req.params;
//         const { questionId, userAnswer, timeTaken } = req.body;
//         const userId = req.user.id;

//         const testSession = await TestSession.findOne({ _id: sessionId, user: userId, status: 'in_progress' });

//         if (!testSession) {
//             return res.status(404).json({ message: 'סשן מבחן לא נמצא או אינו פעיל.' });
//         }

//         // ודא שהשאלה שהתקבלה היא אכן השאלה הנוכחית בסשן
//         let expectedQuestionId;
//         if (testSession.currentQuestionType === 'psychotechnical') {
//             expectedQuestionId = testSession.psychotechnicalQuestions[testSession.currentQuestionIndex];
//         } else {
//             expectedQuestionId = testSession.personalityQuestions[testSession.currentQuestionIndex];
//         }

//         if (!expectedQuestionId || expectedQuestionId.toString() !== questionId) {
//             return res.status(400).json({ message: 'שאלה שגויה או סדר שאלות לא תקין.' });
//         }

//         let questionData;
//         let isCorrect = null;
//         let questionDifficulty = 0;

//         if (testSession.currentQuestionType === 'psychotechnical') {
//             questionData = await PsychotechnicalQuestion.findById(questionId);
//             if (questionData) {
//                 isCorrect = (userAnswer === questionData.correctAnswer);
//                 questionDifficulty = questionData.difficulty; // שמור את קושי השאלה
//                 // עדכון ציון גולמי וציונים מפורטים
//                 if (isCorrect) {
//                     testSession.totalScore += 1; // הגדל ציון כולל
//                     // הגדל ציון בקטגוריה הספציפית
//                     if (testSession.detailedPsychotechnicalScores[questionData.category] !== undefined) {
//                         testSession.detailedPsychotechnicalScores[questionData.category] += 1;
//                     }
//                 }
//             }
//         } else if (testSession.currentQuestionType === 'personality') {
//             questionData = await PersonalityQuestion.findById(questionId);
//             if (questionData) {
//                 questionDifficulty = questionData.difficulty || 0; // או פרמטר רלוונטי אחר לאישיות
//                 // לוגיקה לחישוב ציון אישיותי (לדוגמה, המרת תשובה מסקאלה מספרית וכיול לכיוון השאלה)
//                 const answerIndex = questionData.options.indexOf(userAnswer); // לדוגמה, אם התשובות הן מערך סטרינגים
//                 if (answerIndex !== -1) {
//                     const scoreValue = (answerIndex + 1) * (questionData.direction || 1); // ניקוד מ-1 עד N, כפול כיוון
//                     if (testSession.personalityResults[questionData.scale] !== undefined) {
//                         testSession.personalityResults[questionData.scale] += scoreValue;
//                     }
//                 }
//             }
//         }

//         if (!questionData) {
//             return res.status(404).json({ message: 'השאלה לא נמצאה.' });
//         }

//         // הוסף את התשובה למערך התשובות בסשן
//         testSession.answers.push({
//             question: questionId,
//             questionType: testSession.currentQuestionType,
//             userAnswer: userAnswer,
//             isCorrect: isCorrect,
//             timeTaken: timeTaken,
//             difficultyAtQuestion: questionDifficulty
//         });

//         // קדם את האינדקס לשאלה הבאה
//         testSession.currentQuestionIndex++;

//         // שלוף את השאלה הבאה (לוגיקה אדפטיבית/סדר עוקב)
//         const nextQuestion = await getNextQuestion(testSession);

//         if (!nextQuestion) {
//             // אם אין יותר שאלות, סמן את הסשן כ"לסיום" (pending_completion)
//             testSession.status = 'pending_completion'; // סטטוס חדש שיאותת ללקוח לסיים
//             await testSession.save();
//             return res.status(200).json({
//                 message: 'סשן המבחן הגיע לסופו. אנא בצע סיום.',
//                 isCompleted: true,
//                 sessionId: testSession._id
//             });
//         }

//         await testSession.save();

//         res.status(200).json({
//             message: 'התשובה נשמרה בהצלחה.',
//             question: nextQuestion,
//             currentQuestionIndex: testSession.currentQuestionIndex,
//             currentQuestionType: testSession.currentQuestionType,
//             isCompleted: false
//         });

//     } catch (error) {
//         console.error('Error submitting answer:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בשמירת תשובה', error: error.message });
//     }
// };

// // 3. סיום ועיבוד סשן מבחן
// exports.finalizeTestSession = async (req, res) => {
//     try {
//         const { sessionId } = req.params;
//         const userId = req.user.id;

//         const testSession = await TestSession.findOne({ _id: sessionId, user: userId });

//         if (!testSession) {
//             return res.status(404).json({ message: 'סשן מבחן לא נמצא.' });
//         }
//         if (testSession.status === 'completed') {
//             return res.status(400).json({ message: 'סשן מבחן זה כבר הושלם.' });
//         }

//         // עדכן סטטוס וזמן סיום
//         testSession.status = 'completed';
//         testSession.endTime = Date.now();

//         // -------------------------------------------------------------
//         // לוגיקה לחישוב ציונים סופיים, IRT, והשוואה נורמטיבית
//         // **זה המקום בו תבוצע העבודה הסטטיסטית המשמעותית**
//         // -------------------------------------------------------------

//         // דוגמה לחישוב ציון IRT פשוט (כדי להמחיש את הרעיון)
//         // בפועל, הייתם משתמשים באלגוריתם מתקדם יותר עם פרמטרי IRT של השאלות
//         let psychotechnicalAbilityEstimate = 0;
//         let numCorrectPsychotechnical = 0;
//         let sumDifficulty = 0;

//         // חישוב מקדים של יכולת פסיכוטכנית (דוגמה פשטנית בלבד)
//         testSession.answers.forEach(answer => {
//             if (answer.questionType === 'psychotechnical' && answer.isCorrect !== null) {
//                 // נניח ש-`difficultyAtQuestion` הוא פרמטר 'b' במונחי IRT.
//                 // חישוב היכולת צריך לקחת בחשבון את ה-a, b, c של השאלה.
//                 // כאן נשתמש בחישוב פשטני: ממוצע הקושי של השאלות הנכונות
//                 if (answer.isCorrect) {
//                     numCorrectPsychotechnical++;
//                     sumDifficulty += answer.difficultyAtQuestion;
//                 }
//             }
//         });

//         // לדוגמה: ציון יכולת פסיכוטכני = ממוצע הקושי של שאלות שנענו נכון
//         // בפועל, זה יהיה הערכה של ה-theta באמצעות אלגוריתם (לדוגמה, Maximum Likelihood Estimation)
//         if (numCorrectPsychotechnical > 0) {
//             psychotechnicalAbilityEstimate = sumDifficulty / numCorrectPsychotechnical;
//         } else {
//             // אם אין תשובות נכונות, ניתן להניח יכולת נמוכה
//             psychotechnicalAbilityEstimate = 1; // קושי מינימלי
//         }
//         testSession.finalPsychotechnicalAbility = psychotechnicalAbilityEstimate;


//         // חישוב ציונים נורמטיביים (דוגמה עם נתונים פיקטיביים)
//         const avgPsychotechnicalAbility = 5; // ממוצע היכולת באוכלוסייה
//         const stdDevPsychotechnicalAbility = 2; // סטיית תקן באוכלוסייה

//         testSession.psychotechnicalZScore = calculateZScore(
//             testSession.finalPsychotechnicalAbility,
//             avgPsychotechnicalAbility,
//             stdDevPsychotechnicalAbility
//         );
//         testSession.psychotechnicalPercentile = calculatePercentile(testSession.psychotechnicalZScore);

//         // חישוב פרופיל אישיותי סופי (לדוגמה: ממוצע ציונים לכל סקאלה)
//         const personalityScales = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
//         const finalPersonalityProfile = {};
//         const personalityZScores = {};
//         const personalityPercentiles = {};

//         for (const scale of personalityScales) {
//             const totalScoreForScale = testSession.personalityResults[scale];
//             const questionsInScale = testSession.answers.filter(
//                 a => a.questionType === 'personality' && a.question && a.question.scale === scale
//             ).length;

//             if (questionsInScale > 0) {
//                 // ממוצע תשובות בסקאלה
//                 finalPersonalityProfile[scale] = totalScoreForScale / questionsInScale;
//             } else {
//                 finalPersonalityProfile[scale] = 0;
//             }

//             // חישוב נורמטיבי לאישיות (נתונים פיקטיביים)
//             const avgPersonalityScore = 3; // נניח סקאלה 1-5, ממוצע 3
//             const stdDevPersonalityScore = 1;

//             const z = calculateZScore(finalPersonalityProfile[scale], avgPersonalityScore, stdDevPersonalityScore);
//             personalityZScores[scale] = z;
//             personalityPercentiles[scale] = calculatePercentile(z);
//         }

//         testSession.finalPersonalityProfile = finalPersonalityProfile;
//         testSession.personalityZScore = personalityZScores;
//         testSession.personalityPercentile = personalityPercentiles;


//         await testSession.save();

//         res.status(200).json({
//             message: 'סשן המבחן הושלם והתוצאות עובדו בהצלחה.',
//             results: {
//                 totalScore: testSession.totalScore,
//                 detailedPsychotechnicalScores: testSession.detailedPsychotechnicalScores,
//                 personalityResults: testSession.personalityResults,
//                 finalPsychotechnicalAbility: testSession.finalPsychotechnicalAbility,
//                 finalPersonalityProfile: testSession.finalPersonalityProfile,
//                 psychotechnicalZScore: testSession.psychotechnicalZScore,
//                 psychotechnicalPercentile: testSession.psychotechnicalPercentile,
//                 personalityZScore: testSession.personalityZScore,
//                 personalityPercentile: testSession.personalityPercentile
//             }
//         });

//     } catch (error) {
//         console.error('Error finalizing test session:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בסיום סשן מבחן', error: error.message });
//     }
// };

// // 4. קבלת תוצאות סשן מבחן (לצורך הצגה בדף התוצאות או בפרופיל אישי)
// exports.getTestSessionResults = async (req, res) => {
//     try {
//         const { sessionId } = req.params;
//         const userId = req.user.id;

//         const testSession = await TestSession.findOne({ _id: sessionId, user: userId })
//             .populate('psychotechnicalQuestions') // כדי להציג את השאלות אם צריך (לא חובה)
//             .populate('personalityQuestions'); // כדי להציג את השאלות אם צריך (לא חובה)

//         if (!testSession) {
//             return res.status(404).json({ message: 'סשן מבחן לא נמצא.' });
//         }

//         if (testSession.status !== 'completed') {
//             return res.status(400).json({ message: 'סשן המבחן עדיין לא הושלם.' });
//         }

//         // החזר רק את הנתונים הרלוונטיים לתוצאות
//         res.status(200).json({
//             sessionId: testSession._id,
//             status: testSession.status,
//             startTime: testSession.startTime,
//             endTime: testSession.endTime,
//             totalScore: testSession.totalScore,
//             detailedPsychotechnicalScores: testSession.detailedPsychotechnicalScores,
//             personalityResults: testSession.personalityResults,
//             finalPsychotechnicalAbility: testSession.finalPsychotechnicalAbility,
//             finalPersonalityProfile: testSession.finalPersonalityProfile,
//             psychotechnicalZScore: testSession.psychotechnicalZScore,
//             psychotechnicalPercentile: testSession.psychotechnicalPercentile,
//             personalityZScore: testSession.personalityZScore,
//             personalityPercentile: testSession.personalityPercentile,
//             // ניתן להוסיף מידע נוסף כמו מספר שאלות שנענו נכון, זמן ממוצע לשאלה וכו'.
//         });

//     } catch (error) {
//         console.error('Error fetching test session results:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בשליפת תוצאות מבחן', error: error.message });
//     }
// };

// // 5. קבלת כל סשני המבחן של משתמש (לצורך דף פרופיל אישי)
// exports.getUserTestSessions = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const testSessions = await TestSession.find({ user: userId })
//             .sort({ createdAt: -1 }); // סדר מהחדש לישן

//         res.status(200).json({
//             message: 'סשני מבחן למשתמש נשלפו בהצלחה.',
//             testSessions: testSessions.map(session => ({
//                 sessionId: session._id,
//                 status: session.status,
//                 startTime: session.startTime,
//                 endTime: session.endTime,
//                 totalScore: session.totalScore,
//                 // ניתן להוסיף כאן סיכום קצר של התוצאות
//                 finalPsychotechnicalAbility: session.finalPsychotechnicalAbility,
//                 psychotechnicalPercentile: session.psychotechnicalPercentile
//             }))
//         });

//     } catch (error) {
//         console.error('Error fetching user test sessions:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בשליפת סשני מבחן למשתמש', error: error.message });
//     }
// };

// // 6. ביטול סשן מבחן
// exports.cancelTestSession = async (req, res) => {
//     try {
//         const { sessionId } = req.params;
//         const userId = req.user.id;

//         const testSession = await TestSession.findOneAndUpdate(
//             { _id: sessionId, user: userId, status: 'in_progress' },
//             { $set: { status: 'cancelled', endTime: Date.now() } },
//             { new: true }
//         );

//         if (!testSession) {
//             return res.status(404).json({ message: 'סשן מבחן לא נמצא או שאינו פעיל להתחברות.' });
//         }

//         res.status(200).json({ message: 'סשן המבחן בוטל בהצלחה.', sessionId: testSession._id });

//     } catch (error) {
//         console.error('Error cancelling test session:', error);
//         res.status(500).json({ message: 'שגיאה בשרת בביטול סשן מבחן', error: error.message });
//     }
// };