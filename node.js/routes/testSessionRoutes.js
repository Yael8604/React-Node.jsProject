const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const testController = require('../controllers/testSessionController');

// נתיב חדש: התחלת בחינה פסיכוטכנית - יחזיר את מבנה הבחינה והשאלות
router.get('/start-psychotechnical', verifyJWT, testController.startPsychotechnicalExam);

// שינוי: נתיב שליחת תשובה בודדת (עם timeTaken)
router.post('/submit-answer', verifyJWT, testController.submitAnswers);

// נתיב חדש: סיום סשן בחינה
router.post('/end-session', verifyJWT, testController.endTestSession);

// נתיב חדש: מעבר לחלק הבא
router.post('/next-section', verifyJWT, testController.moveToNextSection);

module.exports = router;

// // src/routes/testSessionRoutes.js
// const express = require('express');
// const router = express.Router();
// const testSessionController = require('../controllers/testSessionController');
// const { protect } = require('../middleware/authMiddleware'); // ודא שאתה מייבא את ה-middleware הנכון

// // כל הנתיבים הללו יהיו מוגנים ודורשים JWT
// router.post('/start',verifyJWT, protect, testSessionController.startTestSession);
// router.post('/:sessionId/answer', verifyJWT, protect, testSessionController.submitAnswer);
// router.post('/:sessionId/complete',verifyJWT, protect, testSessionController.finalizeTestSession);
// router.get('/:sessionId/results',verifyJWT, protect, testSessionController.getTestSessionResults);
// router.get('/user',verifyJWT, protect, testSessionController.getUserTestSessions); // חדש: קבלת כל הסשנים של המשתמש
// router.patch('/:sessionId/cancel',verifyJWT, protect, testSessionController.cancelTestSession); // חדש: ביטול סשן

// module.exports = router;