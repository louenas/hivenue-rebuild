// backend/utils/stripe.js

const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15', // Use the latest API version or as per your requirements
});

module.exports = stripe;