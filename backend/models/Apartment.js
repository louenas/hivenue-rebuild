// backend/models/Apartment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const apartmentSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  rooms: { type: Number, required: true },
  availabilityPeriods: [{
    start: Date,
    end: Date,
  }],
  amenities: [String],
  images: [String], // URLs or file paths
  price: { type: Number, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  // Additional fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Apartment', apartmentSchema);