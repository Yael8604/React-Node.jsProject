// baseQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const baseQuestionSchema = new Schema({
  text: { type: String, required: true },
  category: { type: String, required: true }, 
}, { _id: false }); // _id: false כדי לא ליצור מזה תת-מסמך

module.exports = baseQuestionSchema;