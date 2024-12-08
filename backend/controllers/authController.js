// backend/controllers/authController.js
require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('../utils/stripe'); // Ensure you have a Stripe instance

// Register User
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Define allowed roles
  const allowedRoles = ['admin', 'owner', 'tenant'];
  
  // Validate role
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified.' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists.' });

    // Create new user instance
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
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });

    // Associate Stripe Customer ID with user
    user.stripeCustomerId = customer.id;
    await user.save();

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
};