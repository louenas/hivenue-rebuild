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
  amount: {
    type: Number,
    required: true,
  },
  paymentMethodId: {
    type: String,
    required: true,
  },
  paymentIntentId: {
    type: String,
  },
  adminApproved: {
    type: Boolean,
    default: false,
  },
  ownerApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Pending', 'Admin Approved', 'Owner Approved', 'Rejected'],
    default: 'Pending',
  },
  invoiceId: {
    type: String,
    default: null,
  },
  invoiceStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);