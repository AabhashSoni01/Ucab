const MyBooking = require('../models/booking');
const Car = require('../models/car');

const bookCab = async (req, res) => {
  try {
    const { carId, pickupLocation, dropLocation, bookingDate, bookingTime, estimatedDistance, notes, totalFare: clientFare, paymentMethod, refreshments, donation, promoCode } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found.' });
    if (!car.isAvailable) return res.status(400).json({ success: false, message: 'Car is not available.' });

    const totalFare = clientFare || (estimatedDistance ? estimatedDistance * car.pricePerKm : car.pricePerKm * 5);
    const booking = await MyBooking.create({
      user: req.user._id, car: carId,
      pickupLocation, dropLocation, bookingDate, bookingTime,
      estimatedDistance: estimatedDistance || 0,
      totalFare, notes, paymentMethod, refreshments, donation, promoCode,
    });

    const populated = await MyBooking.findById(booking._id)
      .populate('car', 'name model category image driverName driverPhone pricePerKm rating plateNumber')
      .populate('user', 'name email phone');

    res.status(201).json({ success: true, message: 'Cab booked successfully!', booking: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await MyBooking.find({ user: req.user._id })
      .populate('car', 'name model category image driverName driverPhone pricePerKm rating plateNumber')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id)
      .populate('car', 'name model category image driverName driverPhone pricePerKm rating plateNumber')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    res.status(200).json({ success: true, booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await MyBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    if (['Completed', 'Cancelled'].includes(booking.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking.` });
    booking.status = 'Cancelled';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking cancelled.', booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await MyBooking.find()
      .populate('car', 'name model category image plateNumber')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// ADMIN: Update booking status (includes Start Ride / Complete Ride)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    // Auto-mark payment as paid when completed
    if (status === 'Completed') updateData.paymentStatus = 'Paid';

    const booking = await MyBooking.findByIdAndUpdate(
      req.params.id, updateData, { new: true }
    )
      .populate('car', 'name model category plateNumber')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Emit socket event to notify user in real time
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${booking.user._id}`).emit('ride:statusUpdate', {
        bookingId: booking._id,
        status: booking.status,
        message: status === 'In Progress'
          ? 'Your driver has started the ride! 🚕'
          : status === 'Completed'
          ? 'You have arrived! Ride completed ✅'
          : `Your booking status: ${status}`,
      });
    }

    res.status(200).json({ success: true, message: 'Booking updated!', booking });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/user');
    const [totalUsers, totalCars, totalBookings, pendingBookings, completedBookings, revenue] =
      await Promise.all([
        User.countDocuments(),
        Car.countDocuments(),
        MyBooking.countDocuments(),
        MyBooking.countDocuments({ status: 'Pending' }),
        MyBooking.countDocuments({ status: 'Completed' }),
        MyBooking.aggregate([
          { $match: { paymentStatus: 'Paid' } },
          { $group: { _id: null, total: { $sum: '$totalFare' } } },
        ]),
      ]);
    res.status(200).json({
      success: true,
      stats: { totalUsers, totalCars, totalBookings, pendingBookings, completedBookings, totalRevenue: revenue[0]?.total || 0 },
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = {
  bookCab, getMyBookings, getBookingById, cancelBooking,
  getAllBookings, updateBookingStatus, getDashboardStats,
};