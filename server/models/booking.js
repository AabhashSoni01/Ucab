const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    car:               { type: mongoose.Schema.Types.ObjectId, ref: 'Car',  required: true },
    pickupLocation:    { type: String, required: true, trim: true },
    dropLocation:      { type: String, required: true, trim: true },
    bookingDate:       { type: Date,   required: true },
    bookingTime:       { type: String, required: true },
    estimatedDistance: { type: Number, default: 0 },
    totalFare:         { type: Number, default: 0 },
    status:            { type: String, enum: ['Pending','Confirmed','In Progress','Completed','Cancelled'], default: 'Pending' },
    paymentStatus:     { type: String, enum: ['Unpaid','Paid'], default: 'Unpaid' },
    paymentMethod:     { type: String, default: 'Cash' },
    notes:             { type: String, default: '' },
    promoCode:         { type: String, default: '' },
    donation:          { type: Number, default: 0 },
    refreshments:      { type: Array,  default: [] },
    rideStartedAt:     { type: Date,   default: null },
    rideCompletedAt:   { type: Date,   default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MyBooking', BookingSchema);