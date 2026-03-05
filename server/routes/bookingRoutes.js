const express = require('express');
const router = express.Router();
const {
  bookCab,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
} = require('../controllers/bookingController');
const { protectUser, protectAdmin } = require('../middlewares/authMiddleware');

// User routes
router.post('/book',              protectUser,  bookCab);
router.get('/mybookings',         protectUser,  getMyBookings);
router.get('/:id',                protectUser,  getBookingById);
router.put('/:id/cancel',         protectUser,  cancelBooking);

// Admin routes
router.get('/',                   protectAdmin, getAllBookings);
router.put('/:id',                protectAdmin, updateBookingStatus);

module.exports = router;