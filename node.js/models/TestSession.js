// models/testSession.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  testType: { type: String, enum: ['psychotechnical', 'personality'], required: true }, 

  startedAt: { type: Date, default: Date.now },

  endedAt: { type: Date },

  psychotechnicalQuestionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PsychotechnicalQuestion' }],

  PersonalityQuestionids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PersonalityQuestion' }],

  answers: [{ type: Schema.Types.ObjectId, ref: 'userAnswer' }], // קישור לכל התשובות שנשמרו

  summary: {
    // התוצאות המסכמות לפי תחום קוגניטיבי או אישיותי
    type: Map,
    of: new Schema({
      totalScore: { type: Number },
      zScore: { type: Number },//סטית תקן
      percentile: { type: Number }, // באחוזון יחסית לאוכלוסייה
      description: { type: String }
    }, { _id: false })//mongoos מוסיף אוטמטית שדה id עבור כל תת סכימה ולכן נגדיר כאן false שז"א שאין צורך בזה
  },

  rawScores: {
    type: Map,
    of: Number // אפשר לשמור ציונים גולמיים לפי תחום
  },

  status: { type: String, enum: ['in_progress', 'completed', 'cancelled'], default: 'in_progress' },

  notes: { type: String } // לצורך מידע נוסף בעתיד (למשל "נקטע באמצע", הערות אבחון וכו')
  
}, { timestamps: true });

module.exports = mongoose.model('TestSession', testSessionSchema);



// // src/models/TestSession.js
// const mongoose = require('mongoose');

// // סוגי שאלות שנתמכות במערכת
// const QUESTION_TYPES = ['psychotechnical', 'personality'];

// // הגדרת סכימה עבור תשובה ספציפית בתוך סשן מבחן
// // כל אובייקט ייצג שאלה אחת עליה המשתמש ענה
// const userAnswerSchema = new mongoose.Schema({
//     question: {
//         type: mongoose.Schema.Types.ObjectId,
//         refPath: 'questionType', // מצביע למודל הנכון (PsychotechnicalQuestion או PersonalityQuestion)
//         required: true
//     },
//     questionType: {
//         type: String,
//         required: true,
//         enum: QUESTION_TYPES // ודא שסוג השאלה תקין
//     },
//     userAnswer: {
//         type: mongoose.Schema.Types.Mixed, // יכול להכיל סטרינג, מספר, מערך (לדוגמה, לתשובות מרובות)
//         required: true
//     },
//     isCorrect: {
//         type: Boolean, // רלוונטי רק לשאלות פסיכוטכניות
//         default: null // null כאשר לא רלוונטי (לדוגמה, לשאלות אישיותיות)
//     },
//     timeTaken: {
//         type: Number, // זמן שלקח למשתמש לענות על השאלה (בשניות)
//         default: 0
//     },
//     // פרמטרים נוספים אם נרצה לשמור את קושי השאלה הספציפית עליה ענה
//     // או הערכות יכולת תוך כדי המבחן
//     difficultyAtQuestion: {
//         type: Number, // רמת הקושי של השאלה הספציפית בעת הצגתה
//         default: 0
//     },
//     // ניתן להוסיף כאן פרמטרים נוספים אם תרצו לפתח מודל IRT מלא בעתיד
//     // לדוגמה: discriminationAtQuestion, guessingAtQuestion
// }, { _id: false }); // לא ניצור _id נפרד לכל תשובה בתוך המערך

// // הגדרת סכימה עבור סשן מבחן
// const testSessionSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     // שאלות פסיכוטכניות שנבחרו עבור סשן זה
//     psychotechnicalQuestions: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'PsychotechnicalQuestion'
//     }],
//     // שאלות אישיותיות שנבחרו עבור סשן זה
//     personalityQuestions: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'PersonalityQuestion'
//     }],
//     answers: [userAnswerSchema], // מערך התשובות של המשתמש
    
//     currentQuestionIndex: { // אינדקס השאלה הנוכחית שהמשתמש צריך לענות עליה
//         type: Number,
//         default: 0
//     },
//     currentQuestionType: { // סוג השאלה הנוכחית (פסיכוטכנית / אישיותית)
//         type: String,
//         enum: QUESTION_TYPES,
//         default: 'psychotechnical' // מתחילים בד"כ עם פסיכוטכני
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'in_progress', 'completed', 'cancelled'],
//         default: 'pending' // 'pending' = נוצר, 'in_progress' = בביצוע, 'completed' = הסתיים
//     },
//     startTime: {
//         type: Date,
//         default: Date.now
//     },
//     endTime: {
//         type: Date
//     },
//     totalScore: {
//         type: Number, // ציון סופי לשאלות פסיכוטכניות
//         default: 0
//     },
//     // ציונים מפורטים לפי קטגוריות/סקאלות (לדוגמה, חשיבה לוגית, כמותית, חשיבה מרחבית)
//     // הערה: ניתן להוסיף sub-schemas עבור ציונים מפורטים יותר
//     detailedPsychotechnicalScores: {
//         logic: { type: Number, default: 0 },
//         quantitative: { type: Number, default: 0 },
//         spatial: { type: Number, default: 0 },
//         // ... הוסף קטגוריות נוספות לפי הצורך
//     },
//     // תוצאות עבור מבחן האישיות (לדוגמה, Big Five או מדדים אחרים)
//     personalityResults: {
//         openness: { type: Number, default: 0 },
//         conscientiousness: { type: Number, default: 0 },
//         extraversion: { type: Number, default: 0 },
//         agreeableness: { type: Number, default: 0 },
//         neuroticism: { type: Number, default: 0 },
//         // ... הוסף מימדי אישיות נוספים לפי הצורך
//     },
//     finalPsychotechnicalAbility: { // ציון יכולת פסיכוטכני סופי (IRT theta)
//         type: Number,
//         default: null
//     },
//     finalPersonalityProfile: { // פרופיל אישיותי סופי (IRT theta או ציונים אחרים)
//         type: Object, // יכול להכיל אובייקט מורכב יותר
//         default: null
//     },
//     // נתונים נורמטיביים להשוואה (אחוזון, ציון תקן)
//     psychotechnicalPercentile: {
//         type: Number,
//         default: null
//     },
//     psychotechnicalZScore: {
//         type: Number,
//         default: null
//     },
//     // ניתן להוסיף גם עבור אישיות
//     personalityPercentile: {
//         type: Object, // אובייקט המכיל אחוזונים לכל מימד
//         default: null
//     },
//     personalityZScore: {
//         type: Object, // אובייקט המכיל ציוני תקן לכל מימד
//         default: null
//     }

// }, { timestamps: true }); // הוסף חותמות זמן ליצירה ועדכון

// module.exports = mongoose.model('TestSession', testSessionSchema);