const express = require('express');
const router = express.Router();
const {
  initiatePayment, confirmPayment, getPaymentByBooking, getMyPayments,
} = require('../controllers/paymentController');
const { protectUser } = require('../middlewares/authMiddleware');

router.post('/initiate', protectUser, initiatePayment);
router.put('/:id/confirm', protectUser, confirmPayment);
router.get('/booking/:bookingId', protectUser, getPaymentByBooking);
router.get('/my', protectUser, getMyPayments);

module.exports = router;