// personalityQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseQuestionSchema = require('./baseQuestion').schema; // קבלת הסכמה הבסיסית

const personalityQuestionSchema = new Schema({
  ...baseQuestionSchema.obj, // הוספת השדות מהסכמה הבסיסית
  scale: { type: String },//הממד האישיותי שהשאלה נועדה למדוד (מוחצנות, נעימות וכו')
  answerOptions: { type: [String] }, //סולם התגובה (למשל, סולם ליקרט).
  scoringDirection: { type: String, enum: ['positive', 'negative'] }//האם הסכמה עם ההיגד מעידה על רמה גבוהה או נמוכה בממד הנמדד.
});

const PersonalityQuestion = mongoose.model('PersonalityQuestion', personalityQuestionSchema,'personality_questions');
module.exports = PersonalityQuestion;