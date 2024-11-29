// backend/routes/bookings.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Authentication middleware
const role = require('../middleware/role'); // Authorization middleware
const Booking = require('../models/Booking'); // Booking model
const Apartment = require('../models/Apartment'); // Apartment model
const stripe = require('../utils/stripe'); // Stripe instance

// Helper function to calculate months between dates (rounded up)
function calculateMonths(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in months
  const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
  
  // If there are any remaining days, round up to next month
  const dayDiff = end.getDate() - start.getDate();
  return dayDiff > 0 ? monthDiff + 1 : monthDiff;
}

// GET /api/bookings/pending - Fetch all pending bookings (Admin/Owner)
router.get('/pending', auth, role(['admin', 'owner']), async (req, res) => {
  try {
    const pendingBookings = await Booking.find({ status: 'Pending' })
      .populate('apartment')
      .populate('tenant');

    res.json({ bookings: pendingBookings });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ message: 'Failed to fetch pending bookings.' });
  }
});

// POST /api/bookings/:id/approve - Approve a booking and process payment (Admin/Owner)
router.post('/:id/approve', auth, role(['admin', 'owner']), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId).populate('tenant').populate('apartment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking request is not pending.' });
    }

    // Process Payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.amount * 100, // Convert to cents for Stripe
      currency: 'usd',
      customer: booking.tenant.stripeCustomerId,
      payment_method: booking.paymentMethodId,
      off_session: true,
      confirm: true,
    });

    // Update Booking Status
    booking.status = 'Approved';
    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({ message: 'Booking approved and payment processed successfully.', booking });
  } catch (error) {
    console.error('Error approving booking:', error);

    if (error.code === 'authentication_required') {
      // Handle scenario where additional authentication is required
      return res.status(400).json({ message: 'Authentication required to process payment.' });
    }

    res.status(500).json({ message: 'Failed to approve booking and process payment.' });
  }
});

// PUT /api/bookings/:id/approve/admin - Approve a booking (Admin/Owner)
router.put('/:id/approve/admin', auth, role(['admin', 'owner']), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId).populate('tenant').populate('apartment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking is not pending.' });
    }

    // Additional business logic can be added here

    booking.status = 'admin_approved';
    await booking.save();

    res.json({ message: 'Booking approved successfully.', booking });
  } catch (error) {
    console.error('Error approving booking:', error);
    res.status(500).json({ message: 'Failed to approve booking.' });
  }
});

// PUT /api/bookings/:id/deny/admin - Deny a booking (Admin/Owner)
router.put('/:id/deny/admin', auth, role(['admin', 'owner']), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking is not pending.' });
    }

    booking.status = 'admin_denied';
    await booking.save();

    res.json({ message: 'Booking denied successfully.', booking });
  } catch (error) {
    console.error('Error denying booking:', error);
    res.status(500).json({ message: 'Failed to deny booking.' });
  }
});

module.exports = router;