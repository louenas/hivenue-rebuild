// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const stripe = require('../utils/stripe');
const Booking = require('../models/Booking');

// POST /api/payments/create-setup-intent
router.post('/create-setup-intent', auth, async (req, res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: req.user.stripeCustomerId,
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Error creating SetupIntent:', error);
    res.status(500).json({ message: 'Failed to create SetupIntent.' });
  }
});

// Create a payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in smallest currency unit (e.g., cents)
      currency,
      // Additional options like metadata can be added
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Stripe error');
  }
});

// Handle webhook events (e.g., payment confirmation)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Update booking status or perform other actions
      break;
    // Handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Set a payment method as the customer's default
router.post('/set-default-payment-method', auth, async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const customer = await stripe.customers.update(
      req.user.stripeCustomerId,
      {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      }
    );

    res.send({ customer });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Stripe error');
  }
});

module.exports = router;