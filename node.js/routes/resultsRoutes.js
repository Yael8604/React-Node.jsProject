const express = require('express');
const router = express.Router();
const { getResults  } = require('../controllers/resultsController');
const verifyJWT = require('../middleware/verifyJWT');

router.get('/results',verifyJWT, getResults);

module.exports = router;