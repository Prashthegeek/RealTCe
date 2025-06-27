const express = require('express');
const { signup, verifyOtp,resendOtp, login } = require('../controllers/authControllers');
// const passportSetup = require('../config/passport-setup')  //this needs to be in server.js
const passport= require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/signup',signup);  //api/auth/signup
router.post('/verify-otp',verifyOtp);  //api/auth/verify-Otp
router.post('/resend-otp',resendOtp);  //api/auth/resend-Otp
router.post('/login',login);  //api/auth/login

//get request(for oAuth2.0)
router.get('/google',passport.authenticate('google',{  //passport.authenticate('google') will open the google consent screen
    scope:['profile','email']  //the information i want to have from google 
}));  //api/auth/google

//callback
router.get('/google/redirect', passport.authenticate('google') , (req,res)=>{//middleware passport.authentical('google') will authenticate the code  in the url with google and then will go/run the  googleStrategy callback before running the code inside this block
    // Assuming req.user contains the authenticated user details from Google
    const user = req.user;  // Contains user information like id, name, email, etc.

    // Generate a JWT token
    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email }, // Payload
        process.env.JWT_SECRET,  // Secret key (stored securely in .env)
        { expiresIn: '1h' }      // Optional: Set the expiration time for the token
    );

    // Redirect the user to the frontend with the token in the URL
    const BASE_URI = process.env.FRONTEND_URL || 'http://51.20.117.228:3000';
    const frontendUrl = `${BASE_URI}/google-redirect?token=${token}&id=${user.id}&name=${user.name}&email=${user.email}`;  //not a dynamic route , in frontend(in app.jsx) Route path="/google-redirect will do , since, agar direct / ke baad value likhe hote ,then route me /../:something lena parta like in rooms/:roomId ,since, in url / ke direct baad value of roomId was used 

    // Redirect to the frontend page with the token and user details
    res.redirect(frontendUrl);
})


module.exports = router;

