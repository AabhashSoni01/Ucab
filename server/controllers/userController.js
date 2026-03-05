const User = require('../models/user');
const MyBooking = require('../models/booking');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true, message: 'Registration successful!', token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // User was deleted by admin
    if (!user)
      return res.status(404).json({ success: false, message: 'Account not found. Please create a new account.', deleted: true });

    if (!(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.', deactivated: true });

    const token = generateToken(user._id);
    res.status(200).json({
      success: true, message: 'Login successful!', token,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ success: false, message: 'Account not found.', deleted: true });
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, phone }, { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, message: 'Profile updated!', user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADMIN: Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADMIN: Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADMIN: Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, { name, email, phone, isActive }, { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.status(200).json({ success: true, message: 'User updated!', user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADMIN: Delete user — also removes all their bookings
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Delete all bookings belonging to this user
    const deletedBookings = await MyBooking.deleteMany({ user: req.params.id });

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User deleted along with ${deletedBookings.deletedCount} booking(s).`,
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
  registerUser, loginUser, getUserProfile, updateUserProfile,
  getAllUsers, getUserById, updateUser, deleteUser,
};