const express = require('express');
const router = express.Router();
const {
  registerDriver,
  loginDriver,
  getDriverProfile,
  updateDriverProfile,
  toggleAvailability,
  getDriverRides,
  updateRideStatus,
} = require('../controllers/driverController');
const { protectDriver } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

// Public
router.post('/register', upload.single('profileImage'), registerDriver);
router.post('/login', loginDriver);

// Protected
router.get('/profile', protectDriver, getDriverProfile);
router.put('/profile', protectDriver, upload.single('profileImage'), updateDriverProfile);
router.put('/availability', protectDriver, toggleAvailability);
router.get('/rides', protectDriver, getDriverRides);
router.put('/rides/:id/status', protectDriver, updateRideStatus);

module.exports = router;