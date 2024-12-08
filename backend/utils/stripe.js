// backend/utils/stripe.js
require('dotenv').config();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use the latest API version or as per your requirements
});

module.exports = stripe;