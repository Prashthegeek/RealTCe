const express = require('express');
const {executeCode} = require('../controllers/ExecuteCodeController')

const router = express.Router();

router.post('/' , executeCode) ;   //  /api/execute/ or /api/execute

module.exports = router ; 