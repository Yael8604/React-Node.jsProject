const PsychotechnicalQuestion = require('../models/Question/psychotechnicalQuestion');

exports.getQuestions = async (req, res) => {
  try {
    const questions = await PsychotechnicalQuestion.find({});
    res.status(200).json(questions);  // מחזירים את השאלות בתור JSON
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err });
  }
};
