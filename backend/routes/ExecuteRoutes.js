const express = require('express');
const {executeCode} = require('../controllers/ExecuteCodeController')
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {  //in backend , we define the protect function but in frontend (we wrap the child component with a component which checks for the authorization)
  // const token = req.headers.authorization?.split(' ')[1]; // Extract token from 'Authorization' header
  const {user} = req.body ;
  console.log(user);
  if (!user) {
    return res.status(401).json({ message: 'authorization denied' });
  }
  //else part
  next() ;

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
  //   req.user = decoded; // Add the user data to the request object
  //   next(); // Proceed to the next middleware/controller
  // } catch (err) {
  //   return res.status(401).json({ message: 'Invalid token' });
  // }
};


const router = express.Router();

router.post('/' ,protect, executeCode) ;   //  /api/execute/ or /api/execute //before the execute controller call ,protect function will be called

module.exports = router ; 