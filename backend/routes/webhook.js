// backend/routes/webhooks.js

const express = require('express');
const router = express.Router();
const stripe = require('../utils/stripe');
require('dotenv').config();
const Booking = require('../models/Booking'); // Import Booking model

// POST /api/webhooks/stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Find the booking by paymentIntentId and update status if needed
      try {
        const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
        if (booking) {
          // Additional actions if needed
          console.log(`Payment succeeded for Booking ID: ${booking._id}`);
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
      }
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      // Find the booking and notify Admin/Owner and Tenant
      try {
        const booking = await Booking.findOne({ paymentIntentId: failedIntent.id });
        if (booking) {
          booking.status = 'Payment Failed';
          await booking.save();
          // Implement notification logic here
          console.log(`Payment failed for Booking ID: ${booking._id}`);
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
      }
      break;
    // ... handle other event types
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;