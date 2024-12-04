const User = require('../models/User');
const generateOtp = require('../utils/generateOtp');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');  //for login part , match password 

require('dotenv').config();   // frontend me bhi karna parta hai one time requier


// Create the transporter outside the function
const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_PASS,
    },
  });
  
  // Signup with OTP
  exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
  
    try {

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        // If the user is verified, throw an error
        if (existingUser.isVerified) {
          return res.status(400).json({ message: 'Account already exists,Please Login' });  //since, status 400 se bheja hu, so , receiving end me catch block me jaayega and toast will be shown with the description of this message
        } else {
          // If the user is not verified, allow the signup process and resend OTP
          const otp = generateOtp();
          
          existingUser.otp = otp;
          existingUser.name = name; // Update user data with the latest info if necessary
          existingUser.password = password; // Note: hashing should still be handled before save
          await existingUser.save();
          
          // Resend OTP via email
          await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject: 'Resend OTP for Account Verification',
            text: `Your OTP is ${otp}`,
          });
          return res.status(200).json({ message: 'User exists but is not verified. OTP has been resent.' });
        }
      }
      //if abhi tak return nhi hua hai,then user doesn't exist
      // If the user doesn't exist, proceed with creating a new one
      const user = await User.create({ name, email, password });
      const otp = generateOtp();
      user.otp = otp;
      await user.save();
  
      // Send OTP via email
      await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:email,
        subject: 'Verify your account',
        text: `Your OTP is ${otp}`,
      });
  
      res.status(201).json({ message: 'User created. Please verify your email.' });
  
    } catch (error) {
      res.status(500).json({ error: error.message || 'Server error' });
    }
  };
  
// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save(); //so, document of this user will be modified (isVerified will be true)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(200).json({ token, message: 'Account verified' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

//resend otp
exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      //else
      const otp = generateOtp();
      console.log(otp);
      user.otp = otp;
      await user.save();
  
      // Send OTP via email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Resend OTP for Account Verification',
        text: `Your OTP is ${otp}`,
      });
  
      res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  


  //for login part

  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    // Create and assign a token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
  
    // Send response with token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name, isVerified: user.isVerified },
    });
  };
