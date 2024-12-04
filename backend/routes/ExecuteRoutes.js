const express = require('express');
const {executeCode} = require('../controllers/ExecuteCodeController')
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Authorization' header

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Add the user data to the request object
    next(); // Proceed to the next middleware/controller
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


const router = express.Router();

router.post('/' ,protect, executeCode) ;   //  /api/execute/ or /api/execute

module.exports = router ; 