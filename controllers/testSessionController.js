const Answer = require('../models/Answer');
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

const TestSession = require('../models/TestSession'); // מייבא את הסכימה של TestSession
const UserAnswer = require('../models/UserAnswer');  // מייבא את הסכימה של תשובות משתמשים

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

module.exports = { finalizeTestSession };


//השליחה לשרת בסיום המבחן תיראה בערך כך:
// POST /api/testSessions/finalize
// body: {
//   userId,
//   testSessionId,
//   ageGroup: "30-39"
// }
