const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getAdminProfile } = require('../controllers/adminController');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { addCar, updateCar, deleteCar } = require('../controllers/carController');
const { getAllBookings, updateBookingStatus, getDashboardStats } = require('../controllers/bookingController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protectAdmin, getAdminProfile);

// Dashboard stats
router.get('/stats', protectAdmin, getDashboardStats);

// User management
router.get('/users', protectAdmin, getAllUsers);
router.get('/users/:id', protectAdmin, getUserById);
router.put('/users/:id', protectAdmin, updateUser);
router.delete('/users/:id', protectAdmin, deleteUser);

// Car management
router.post('/cars', protectAdmin, upload.single('image'), addCar);
router.put('/cars/:id', protectAdmin, upload.single('image'), updateCar);
router.delete('/cars/:id', protectAdmin, deleteCar);

// Booking management
router.get('/bookings', protectAdmin, getAllBookings);
router.put('/bookings/:id', protectAdmin, updateBookingStatus);

module.exports = router;