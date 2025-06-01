// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

// כאן אנחנו מגדירים את המסלול (route) שיגיב על בקשת GET
router.get('/questions', questionController.getQuestions);

module.exports = router;
