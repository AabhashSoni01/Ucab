/**
 * paymentService.js
 * Handles payment creation, confirmation, and reconciliation.
 */

const Payment = require('../models/Payment');
const MyBooking = require('../models/booking');
const { TAX_RATE } = require('./fareService');

/**
 * Create a pending payment record for a booking.
 */
const createPaymentRecord = async (bookingId, userId, method = 'Cash') => {
  const booking = await MyBooking.findById(bookingId).populate('car', 'pricePerKm');
  if (!booking) throw new Error('Booking not found.');

  const existing = await Payment.findOne({ booking: bookingId, status: 'Pending' });
  if (existing) return existing;

  const fare = booking.totalFare || 0;
  const taxAmount = parseFloat((fare * TAX_RATE).toFixed(2));
  const baseFare = booking.car?.pricePerKm * 5 || 50;
  const distanceCharge = Math.max(0, fare - baseFare);

  return Payment.create({
    booking: bookingId,
    user: userId,
    amount: parseFloat((fare + taxAmount).toFixed(2)),
    method,
    baseFare,
    distanceCharge,
    taxAmount,
    status: 'Pending',
  });
};

/**
 * Mark payment as completed.
 */
const completePayment = async (paymentId, transactionId = null) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error('Payment not found.');

  payment.status = 'Completed';
  payment.transactionId = transactionId || `TXN${Date.now()}`;
  payment.paidAt = new Date();
  await payment.save();

  await MyBooking.findByIdAndUpdate(payment.booking, { paymentStatus: 'Paid' });
  return payment;
};

/**
 * Get revenue analytics summary (for admin dashboard).
 */
const getRevenueStats = async () => {
  const [totalRevenue, todayRevenue, pendingPayments] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paidAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.countDocuments({ status: 'Pending' }),
  ]);

  return {
    totalRevenue: totalRevenue[0]?.total || 0,
    todayRevenue: todayRevenue[0]?.total || 0,
    pendingPayments,
  };
};

module.exports = { createPaymentRecord, completePayment, getRevenueStats };