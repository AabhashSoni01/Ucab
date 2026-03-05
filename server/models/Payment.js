const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    booking:        { type: mongoose.Schema.Types.ObjectId, ref: 'MyBooking', required: true },
    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driver:         { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    amount:         { type: Number, required: true, min: 0 },
    currency:       { type: String, default: 'INR' },
    method:         { type: String, enum: ['Cash', 'UPI', 'Card', 'Wallet', 'NetBanking'], default: 'Cash' },
    status:         { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
    transactionId:  { type: String, default: '', trim: true },
    baseFare:       { type: Number, default: 0 },
    distanceCharge: { type: Number, default: 0 },
    taxAmount:      { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    paidAt:         { type: Date, default: null },
    notes:          { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);