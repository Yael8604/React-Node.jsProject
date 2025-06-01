// baseQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const baseQuestionSchema = new Schema({
  type: { type: String, required: true, enum: ['psychotechnical', 'personality'] },
  text: { type: String, required: true },//הטקסט של השאלה
  testPart: { type: String }//לאיזה חלק של הבחינה השאלה שייכת
}, { timestamps: true });

const BaseQuestion = mongoose.model('BaseQuestion', baseQuestionSchema);
module.exports = BaseQuestion;
