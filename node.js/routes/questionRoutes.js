const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const verifyJWT = require('../middleware/verifyJWT'); // ייבוא של ה-middleware המעודכן

// החלת verifyJWT על הנתיב
router.get('/questions', verifyJWT, questionController.getQuestions);

module.exports = router;