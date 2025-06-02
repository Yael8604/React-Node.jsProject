const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');

const testController = require('../controllers/testSessionController') 

// router.post("/start", verifyJWT,testSessionController.startTestSession)

module.exports = router

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