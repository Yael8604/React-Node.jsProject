const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyJWT = require('../middleware/verifyJWT');

// כל הנתיבים הללו דורשים התחברות
router.put('/me', verifyJWT, userController.updateMe);

module.exports = router;
