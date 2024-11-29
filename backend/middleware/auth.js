// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const stripe = require('../utils/stripe'); // Ensure stripe instance is imported
require('dotenv').config();

module.exports = async (req, res, next) => {
  // Attempt to retrieve token from 'x-auth-token' header
  let token = req.header('x-auth-token');

  // If not found, attempt to retrieve from 'Authorization' header
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7, authHeader.length).trim();
    }
  }

  console.log('Received token:', token); // Debugging line

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log("userId:" + userId);

    // Fetch user from the database to verify role and get Stripe Customer ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};