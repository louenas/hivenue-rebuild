// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Protect all admin routes
router.use(auth);

// User Management
router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);

// Apartment Management
router.get('/apartments', adminController.getAllApartments);
router.delete('/apartments/:id', adminController.deleteApartment);

// Booking Request Management
router.get('/booking-requests', adminController.getAllBookingRequests);
router.put('/booking-requests/:id/approve', adminController.approveBookingRequest);
router.put('/booking-requests/:id/deny', adminController.denyBookingRequest);

// Booking Management
router.get('/bookings', adminController.getAllBookings);
router.delete('/bookings/:id', adminController.deleteBooking);

module.exports = router;