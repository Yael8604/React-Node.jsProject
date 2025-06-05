// models/userAnswer.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // המשתמש שענה
  questionId: { type: Schema.Types.ObjectId, required: true }, // מזהה השאלה
  questionType: { type: String, enum: ['psychotechnical', 'personality'], required: true }, // סוג השאלה
  answer: { type: Schema.Types.Mixed, required: true }, // ערך התשובה שנבחרה (יכול להיות טקסט או מספר)
  isCorrect: { type: Boolean }, // רלוונטי רק לשאלות פסיכוטכניות
  score: { type: Number }, // ציון נפרד לכל שאלה (למשל 1/0, או ניקוד ליקרט)
  answeredAt: { type: Date, default: Date.now }, // זמן מענה
  timeTaken: { type: Number }, // זמן שלקח למשתמש לענות על השאלה (באלפיות השנייה, או שניות - נחליט בהמשך) **
  analysisResults: { // חדש: תוצאות ניתוח מפייתון
        type: Schema.Types.Mixed, // יכול להכיל מבנה JSON גמיש
        default: {}
    }
}, { timestamps: true });

const UserAnswer = mongoose.model('userAnswer', answerSchema);
module.exports = UserAnswer;