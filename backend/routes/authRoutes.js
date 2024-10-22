const express = require('express');
const { signup, verifyOtp,resendOtp, login } = require('../controllers/authControllers');
const router = express.Router();

router.post('/signup',signup);  //api/auth/signup
router.post('/verify-otp',verifyOtp);  //api/auth/verify-Otp
router.post('/resend-otp',resendOtp);  //api/auth/resend-Otp
router.post('/login',login);  //api/auth/login

module.exports = router;
