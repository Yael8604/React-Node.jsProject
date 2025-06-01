const express = require('express');
const router = express.Router();

const testController = require('../controllers/testSessionController') 

router.post("/start",testSessionontroller.startTestSession)

module.exports = router