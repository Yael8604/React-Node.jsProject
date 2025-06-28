// personalityQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseQuestionSchema = require('./baseQuestion');

const personalityQuestionSchema = new Schema({
  ...baseQuestionSchema.obj, 
  // מגדירים מחדש את category עם enum רלוונטי לאישיותי
  category: {
    type: String,
    enum: [
      'extraversion',
      'conscientiousness',
      'emotional_stability',
      'openness',
      'agreeableness',
      'values',
      'motivations'
    ],
    required: true
  },
  scale: {
    type: String,
    enum: ['likert', 'binary', 'frequency'],
    default: 'likert'
  },
  reverseScored: { type: Boolean, default: false }
}, { timestamps: true });

const PersonalityQuestion = mongoose.model('PersonalityQuestion', personalityQuestionSchema);
module.exports = PersonalityQuestion;