// backend/routes/bookings.js

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth'); // Authentication middleware
const authorize = require('../middleware/authorize'); // Authorization middleware
const Booking = require('../models/Booking'); // Booking model
const Apartment = require('../models/Apartment'); // Apartment model
const stripe = require('../config/stripe'); // Stripe instance
const logger = require('../utils/logger'); // Logger (optional, for better logging)
const InvoiceService = require('../services/invoiceService'); // Invoice service

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

// POST /api/bookings - Create a new booking (Tenant)
router.post('/', 
  auth, 
  authorize('tenant'), 
  [
    body('apartmentId').isMongoId().withMessage('Invalid apartment ID.'),
    body('startDate').isISO8601().toDate().withMessage('Invalid start date.'),
    body('endDate').isISO8601().toDate().withMessage('Invalid end date.'),
    body('paymentMethodId').notEmpty().withMessage('Payment Method ID is required.'),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { apartmentId, startDate, endDate, paymentMethodId } = req.body;

    try {
      // Check if apartment exists
      const apartment = await Apartment.findById(apartmentId);
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found.' });
      }

      // Check date validity
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({ message: 'End date must be after start date.' });
      }

      // Calculate booking duration in months
      const durationMonths = calculateMonths(startDate, endDate);

      // Calculate total amount (assuming apartment.pricePerMonth is defined)
      const totalAmount = apartment.pricePerMonth * durationMonths;

      // Check apartment availability (optional but recommended)
      const conflictingBookings = await Booking.find({
        apartment: apartmentId,
        status: { $in: ['Pending', 'Admin Approved', 'Owner Approved'] },
        $or: [
          { startDate: { $lte: end }, endDate: { $gte: start } },
        ],
      });

      if (conflictingBookings.length > 0) {
        return res.status(400).json({ message: 'Apartment is not available for the selected dates.' });
      }

      // Create new booking
      const newBooking = new Booking({
        tenant: req.user.id,
        apartment: apartmentId,
        startDate,
        endDate,
        amount: totalAmount,
        paymentMethodId,
        status: 'Pending',
      });

      // Save booking to database
      await newBooking.save();

      res.status(201).json({ message: 'Booking request created successfully.', booking: newBooking });
    } catch (error) {
      logger.error(`Error creating booking: ${error.message}`, { stack: error.stack });
      res.status(500).json({ message: 'Failed to create booking.' });
    }
});

// GET /api/bookings/pending - Fetch pending bookings for Admin and Owner
router.get('/pending', auth, authorize('admin', 'owner'), async (req, res) => {
  try {
    let pendingBookings;

    if (req.user.role === 'admin') {
      // Admin retrieves bookings pending admin approval
      pendingBookings = await Booking.find({ adminApproved: false, status: 'Pending' })
        .populate('apartment')
        .populate('tenant');
    } else if (req.user.role === 'owner') {
      // Owner retrieves bookings approved by admin but pending owner approval
      pendingBookings = await Booking.find({ adminApproved: true, ownerApproved: false, status: 'Admin Approved' })
        .populate('apartment')
        .populate('tenant');
    } else {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    res.json({ bookings: pendingBookings });
  } catch (error) {
    logger.error('Error fetching pending bookings:', error);
    res.status(500).json({ message: 'Failed to fetch pending bookings.' });
  }
});

// POST /api/bookings/:id/admin-approve - Admin approves a booking
router.post('/:id/admin-approve', auth, authorize('admin'), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId).populate('tenant').populate('apartment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    if (booking.adminApproved) {
      return res.status(400).json({ message: 'Booking already admin approved.' });
    }

    // Update admin approval status
    booking.adminApproved = true;
    booking.status = 'Admin Approved';
    await booking.save();

    res.json({ message: 'Booking approved by admin successfully.', booking });
  } catch (error) {
    logger.error('Error approving booking by admin:', error);
    res.status(500).json({ message: 'Failed to approve booking.' });
  }
});

// POST /api/bookings/:id/owner-approve - Owner approves a booking
router.post('/:id/owner-approve', auth, authorize('owner'), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId).populate('tenant').populate('apartment');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (!booking.adminApproved) {
      return res.status(400).json({ message: 'Admin must approve before owner can approve.' });
    }

    if (booking.ownerApproved) {
      return res.status(400).json({ message: 'Booking already owner approved.' });
    }

    // Calculate the number of months for the booking
    const durationMonths = calculateMonths(booking.startDate, booking.endDate);
    
    // Calculate the total amount based on the apartment's price per month
    const apartment = await Apartment.findById(booking.apartment);
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found.' });
    }
    
    booking.amount = apartment.pricePerMonth * durationMonths; // Set the calculated amount

    // Update owner approval status
    booking.ownerApproved = true;
    booking.status = 'Owner Approved';

    // Create an invoice after owner approval
    const invoice = await InvoiceService.createInvoice(booking); // Create an invoice using a service
    booking.invoiceId = invoice.id; // Save the invoice ID to the booking
    booking.invoiceStatus = 'Pending'; // Set the invoice status

    // Save the updated booking
    await booking.save();

    res.json({ message: 'Booking approved by owner and invoice created successfully.', booking });
  } catch (error) {
    console.error('Error approving booking by owner:', error);
    res.status(500).json({ message: 'Failed to approve booking and create invoice.' });
  }
});

// POST /api/bookings/:id/reject - Admin or Owner can reject a booking
router.post('/:id/reject', auth, authorize('admin', 'owner'), async (req, res) => {
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    if (booking.status !== 'Pending' && booking.status !== 'Admin Approved') {
      return res.status(400).json({ message: 'Booking is not in a state that can be rejected.' });
    }

    booking.status = 'Rejected';

    // Optionally, you can reset approval flags if needed
    booking.adminApproved = false;
    booking.ownerApproved = false;

    await booking.save();

    res.json({ message: 'Booking rejected successfully.', booking });
  } catch (error) {
    logger.error('Error rejecting booking:', error);
    res.status(500).json({ message: 'Failed to reject booking.' });
  }
});

module.exports = router;