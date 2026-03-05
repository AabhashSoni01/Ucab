const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/admin');
const Driver = require('../models/driver');

// Protect user routes
const protectUser = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated.' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Protect admin routes
const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Admin login required.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select('-password');
    if (!req.admin) return res.status(401).json({ success: false, message: 'Admin not found.' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Protect driver routes
const protectDriver = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Driver login required.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.driver = await Driver.findById(decoded.id).select('-password');
    if (!req.driver) return res.status(401).json({ success: false, message: 'Driver not found.' });
    if (!req.driver.isActive) return res.status(403).json({ success: false, message: 'Driver account deactivated.' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

module.exports = { protectUser, protectAdmin, protectDriver };