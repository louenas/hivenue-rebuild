// backend/models/Booking.js

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  apartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Apartment',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  documentation: {
    type: String,
    required: false,
  },
  paymentMethodId: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Denied', 'admin_approved', 'admin_denied'],
    default: 'Pending',
  },
  paymentIntentId: {
    type: String,
    required: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);