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