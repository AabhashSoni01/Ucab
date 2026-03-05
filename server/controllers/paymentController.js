const Payment = require('../models/Payment');
const MyBooking = require('../models/booking');

// @desc    Initiate payment for a booking
// @route   POST /api/payments/initiate
const initiatePayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await MyBooking.findById(bookingId).populate('car');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This booking has already been paid.' });
    }

    const totalFare = booking.totalFare || 0;
    const baseFare = booking.car?.pricePerKm * 5 || 50;
    const distanceCharge = Math.max(0, totalFare - baseFare);
    const taxAmount = parseFloat((totalFare * 0.05).toFixed(2)); // 5% GST
    const finalAmount = totalFare + taxAmount;

    // Check for existing pending payment
    let payment = await Payment.findOne({ booking: bookingId, status: 'Pending' });
    if (!payment) {
      payment = await Payment.create({
        booking: bookingId,
        user: req.user._id,
        amount: finalAmount,
        method: method || 'Cash',
        baseFare,
        distanceCharge,
        taxAmount,
        status: 'Pending',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment initiated.',
      payment: await payment.populate('booking', 'pickupLocation dropLocation totalFare'),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Confirm / complete a payment
// @route   PUT /api/payments/:id/confirm
const confirmPayment = async (req, res) => {
  try {
    const { transactionId, method } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    payment.status = 'Completed';
    payment.transactionId = transactionId || `TXN${Date.now()}`;
    payment.method = method || payment.method;
    payment.paidAt = new Date();
    await payment.save();

    // Mark booking as paid
    await MyBooking.findByIdAndUpdate(payment.booking, { paymentStatus: 'Paid' });

    res.status(200).json({ success: true, message: 'Payment confirmed!', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId })
      .populate('booking', 'pickupLocation dropLocation bookingDate totalFare status')
      .populate('user', 'name email');

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/my
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking', 'pickupLocation dropLocation bookingDate status')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Get all payments
// @route   GET /api/admin/payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('booking', 'pickupLocation dropLocation bookingDate totalFare')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Refund a payment
// @route   PUT /api/admin/payments/:id/refund
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
    if (payment.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded.' });
    }

    payment.status = 'Refunded';
    payment.notes = req.body.reason || 'Refunded by admin';
    await payment.save();

    await MyBooking.findByIdAndUpdate(payment.booking, { paymentStatus: 'Unpaid' });

    res.status(200).json({ success: true, message: 'Payment refunded.', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiatePayment, confirmPayment, getPaymentByBooking,
  getMyPayments, getAllPayments, refundPayment,
};