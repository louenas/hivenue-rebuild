// backend/routes/webhooks.js

require('dotenv').config();

const express = require('express');
const router = express.Router();
const stripe = require('../utils/stripe');
const Booking = require('../models/Booking'); // Import Booking model

// POST /api/webhooks/stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  // const sig = req.headers['stripe-signature'];
  let event = req.body;

  console.log('Received webhook event:', event);

  let invoice;

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded':
    case 'invoice.paid':
      invoice = event.data.object;
      // Find the booking by invoiceId and update status if needed
      try {
        const booking = await Booking.findOne({ invoiceId: invoice.id });
        if (booking) {
          booking.invoiceStatus = "Paid";
          await booking.save();
          console.log(`Payment succeeded for Booking ID: ${booking._id}`);
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
      }
      break;
    case 'invoice.payment_failed':
      invoice = event.data.object;
      // Find the booking and notify Admin/Owner and Tenant
      try {
        const booking = await Booking.findOne({ invoiceId: invoice.id });
        if (booking) {
          booking.invoiceStatus = 'Failed';
          await booking.save();
          // Implement notification logic here
          console.log(`Payment failed for Booking ID: ${booking._id}`);
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
      }
      break;
    case 'customer.subscription.updated':
      subscription = event.data.object;
      // Possible statuses: active, canceled, incomplete, incomplete_expired, past_due, trialing, paused, unpaid
      try {
        const booking = await Booking.findOne({ subscriptionId: subscription.id });
        if (booking) {
          booking.subscriptionStatus = subscription.status;
          await booking.save();

          // Handle specific subscription statuses
          switch (subscription.status) {
            case 'past_due':
            case 'unpaid':
              // TODO: Implement notification logic for payment issues
              console.log(`Subscription payment issue for Booking ID: ${booking._id}`);
              break;
            case 'canceled':
              // TODO: Implement early termination logic if needed
              console.log(`Subscription canceled for Booking ID: ${booking._id}`);
              break;
            case 'active':
              console.log(`Subscription payment successful for Booking ID: ${booking._id}`);
              break;
          }
        }
      } catch (err) {
        console.error('Error updating subscription status:', err);
      }
      break;
    case 'invoice.created':
      invoice = event.data.object;

      let bookingId = invoice.metadata.bookingId;
      console.log(`Invoice created: ${invoice.id} for Booking ID: ${bookingId}`);

      try {
        // Set auto_advance to false to keep the invoice in draft status
        await stripe.invoices.update(invoice.id, { auto_advance: false });
        console.log(`Invoice set to draft: ${invoice.id}`);
      } catch (error) {
        console.error('Error setting invoice to draft:', error);
      }
      break;
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;