const Driver = require('../models/driver');
const MyBooking = require('../models/booking');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id, role: 'driver' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register driver
// @route   POST /api/drivers/register
const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber } = req.body;

    const existing = await Driver.findOne({ $or: [{ email }, { licenseNumber }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.email === email ? 'Email already registered.' : 'License number already exists.',
      });
    }

    const profileImage = req.file ? `/uploads/${req.file.filename}` : '';
    const driver = await Driver.create({ name, email, password, phone, licenseNumber, profileImage });
    const token = generateToken(driver._id);

    res.status(201).json({
      success: true,
      message: 'Driver registered successfully!',
      token,
      driver: {
        _id: driver._id, name: driver.name, email: driver.email,
        phone: driver.phone, isVerified: driver.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login driver
// @route   POST /api/drivers/login
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email }).populate('car', 'name model plateNumber category');
    if (!driver || !(await driver.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!driver.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact admin.' });
    }

    const token = generateToken(driver._id);

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      driver: {
        _id: driver._id, name: driver.name, email: driver.email,
        phone: driver.phone, isVerified: driver.isVerified,
        isAvailable: driver.isAvailable, rating: driver.rating,
        totalRides: driver.totalRides, car: driver.car,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get driver profile
// @route   GET /api/drivers/profile
const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id)
      .select('-password')
      .populate('car', 'name model plateNumber category seats');
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update driver profile
// @route   PUT /api/drivers/profile
const updateDriverProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updateData = { name, phone };
    if (req.file) updateData.profileImage = `/uploads/${req.file.filename}`;

    const driver = await Driver.findByIdAndUpdate(req.driver._id, updateData, {
      new: true, runValidators: true,
    }).select('-password');

    res.status(200).json({ success: true, message: 'Profile updated!', driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle driver availability
// @route   PUT /api/drivers/availability
const toggleAvailability = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id);
    driver.isAvailable = !driver.isAvailable;
    await driver.save();
    res.status(200).json({
      success: true,
      message: `You are now ${driver.isAvailable ? 'available' : 'unavailable'}.`,
      isAvailable: driver.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned rides for driver
// @route   GET /api/drivers/rides
const getDriverRides = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver._id).populate('car');
    if (!driver.car) {
      return res.status(200).json({ success: true, bookings: [], message: 'No car assigned yet.' });
    }

    const bookings = await MyBooking.find({ car: driver.car._id })
      .populate('user', 'name email phone')
      .populate('car', 'name model plateNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ride status (driver accepts/completes)
// @route   PUT /api/drivers/rides/:id/status
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Confirmed', 'In Progress', 'Completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for driver.' });
    }

    const booking = await MyBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name phone').populate('car', 'name model');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Update driver earnings when ride is completed
    if (status === 'Completed') {
      await Driver.findByIdAndUpdate(req.driver._id, {
        $inc: { totalRides: 1, totalEarnings: booking.totalFare || 0 },
      });
    }

    res.status(200).json({ success: true, message: `Ride marked as ${status}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Get all drivers
// @route   GET /api/admin/drivers
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .select('-password')
      .populate('car', 'name model plateNumber category')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Get single driver
// @route   GET /api/admin/drivers/:id
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .select('-password')
      .populate('car', 'name model plateNumber category');
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.status(200).json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Update driver
// @route   PUT /api/admin/drivers/:id
const updateDriver = async (req, res) => {
  try {
    const { name, email, phone, licenseNumber, isActive, isVerified, isAvailable, car } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, licenseNumber, isActive, isVerified, isAvailable, car },
      { new: true, runValidators: true }
    ).select('-password');

    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.status(200).json({ success: true, message: 'Driver updated!', driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: Delete driver
// @route   DELETE /api/admin/drivers/:id
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found.' });
    res.status(200).json({ success: true, message: 'Driver deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerDriver, loginDriver, getDriverProfile, updateDriverProfile,
  toggleAvailability, getDriverRides, updateRideStatus,
  getAllDrivers, getDriverById, updateDriver, deleteDriver,
};