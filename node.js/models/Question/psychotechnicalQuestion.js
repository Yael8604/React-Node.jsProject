// psychotechnicalQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseQuestionSchema = require('./baseQuestion').schema; // קבלת הסכמה הבסיסית

const psychotechnicalQuestionSchema = new Schema({
  ...baseQuestionSchema.obj, // הוספת השדות מהסכמה הבסיסית
  options: { type: [String] },//מערך של אפשרויות תשובה
  correctAnswer: { type: String },//התשובה הנכונה
  ability: { type: String },//היכולת הקוגניטיבית הנבדקת (חשיבה מילולית, כמותית וכו')
  difficulty: { type: String },//רמת הקושי של השאלה
  image: { // שדה חדש עבור תמונה
    data: Buffer, // מכיל את נתוני התמונה בינארית
    contentType: String // מכיל את סוג ה-MIME של התמונה (למשל, 'image/jpeg', 'image/png')
  }
});

const PsychotechnicalQuestion = mongoose.model('PsychotechnicalQuestion', psychotechnicalQuestionSchema,'psychotechnical_questions');
module.exports = PsychotechnicalQuestion;


// // src/models/PsychotechnicalQuestion.js
// const mongoose = require('mongoose');

// const psychotechnicalQuestionSchema = new mongoose.Schema({
//     questionText: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     options: [{ // אפשרויות התשובה
//         type: String,
//         required: true
//     }],
//     correctAnswer: { // התשובה הנכונה
//         type: String, // או Number אם התשובות הן מספרים
//         required: true
//     },
//     category: { // קטגוריה (לדוגמה: "חשיבה לוגית", "כמותי", "חשיבה מרחבית")
//         type: String,
//         required: true,
//         enum: ['logic', 'quantitative', 'spatial', 'verbal'] // דוגמה
//     },
//     difficulty: { // רמת הקושי של השאלה (1-10, או סקאלה אחרת)
//         type: Number,
//         required: true,
//         min: 1,
//         max: 10 // דוגמה
//     },
//     // אלו הפרמטרים של IRT אם תרצה ליישם מודל כזה בעתיד
//     // בשלב זה, נשתמש בעיקר ב-difficulty
//     irt_a: { // Discrimination (הבחנה)
//         type: Number,
//         default: 1.0 // ערך ברירת מחדל
//     },
//     irt_b: { // Difficulty (קושי) - זהה ל-difficulty לעיתים קרובות
//         type: Number,
//         default: 0.0 // ערך ברירת מחדל (ממוצע)
//     },
//     irt_c: { // Guessing (ניחוש)
//         type: Number,
//         default: 0.2 // ערך ברירת מחדל
//     },
//     imageUrl: { // אם יש תמונה לשאלה
//         type: String,
//         default: null
//     },
//     // Other fields you might have (e.g., tags, explanation)
// }, { timestamps: true });

// module.exports = mongoose.model('PsychotechnicalQuestion', psychotechnicalQuestionSchema);