// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const stripe = require('../utils/stripe'); // Stripe instance
require('dotenv').config();

// Allowed roles
const allowedRoles = ['admin', 'manager', 'owner', 'tenant'];

// Helper function to create Stripe customer
async function createStripeCustomer(user) {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });
    user.stripeCustomerId = customer.id;
    await user.save();
    return customer.id;
  } catch (error) {
    console.error('Stripe Customer Creation Error:', error);
    throw error;
  }
}

// Register Route
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate role
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists.' });

    // Create new user
    user = new User({
      name,
      email,
      password,
      role,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to get the user ID
    await user.save();

    // Create Stripe Customer
    await createStripeCustomer(user);

    // Create JWT payload
    const payload = { id: user.id, role: user.role };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).send('Server error');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for existing user
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials.' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials.' });

    // Check if user has a Stripe customer ID, if not create one
    if (!user.stripeCustomerId) {
      await createStripeCustomer(user);
    }

    // Create JWT payload
    const payload = { id: user.id, role: user.role };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Token expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      },
    );
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;