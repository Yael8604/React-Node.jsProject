// psychotechnicalQuestion.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseQuestionSchema = require('./baseQuestion');

const psychotechnicalQuestionSchema = new Schema({
  ...baseQuestionSchema.obj,
  category: {
    type: String,
    enum: [
      'verbal_reasoning',
      'numerical_reasoning',
      'spatial_reasoning',
      'logical_reasoning',
      'technical_aptitude'
    ],
    required: true
  },

  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { timestamps: true });

const PsychotechnicalQuestion = mongoose.model('PsychotechnicalQuestion', psychotechnicalQuestionSchema);
module.exports = PsychotechnicalQuestion;