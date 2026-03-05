const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema(
  {
    name:        { type: String, required: [true, 'Car name is required'], trim: true },
    model:       { type: String, required: [true, 'Car model is required'], trim: true },
    category:    { type: String, enum: ['Mini', 'Sedan', 'SUV', 'Luxury', 'Auto'], required: true },
    plateNumber: { type: String, required: [true, 'Plate number is required'], unique: true, trim: true },
    seats:       { type: Number, required: true, min: 2, max: 8 },
    pricePerKm:  { type: Number, required: true },
    image:       { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    driverName:  { type: String, trim: true },
    driverPhone: { type: String, trim: true },
    rating:      { type: Number, default: 4.5, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', CarSchema);