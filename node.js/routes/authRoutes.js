const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyJWT = require("../middleware/verifyJWT"); // אם יש נתיבים שדורשים אימות כאן

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);
router.get('/me', verifyJWT,authController.me);

module.exports = router;