/**
 * trackingService.js
 * Manages real-time location updates via Socket.IO.
 * Called from sockets/index.js — can also be used in REST endpoints for last-known location.
 */

const Driver = require('../models/driver');
const MyBooking = require('../models/booking');

// In-memory store: driverId → { lat, lng, updatedAt }
const locationCache = new Map();

/**
 * Update driver's location in DB and in-memory cache.
 * @param {string} driverId
 * @param {number} lat
 * @param {number} lng
 */
const updateDriverLocation = async (driverId, lat, lng) => {
  locationCache.set(driverId, { lat, lng, updatedAt: Date.now() });

  // Persist to DB every 5th update (reduces write load)
  const cached = locationCache.get(driverId);
  if (!cached._updateCount) cached._updateCount = 0;
  cached._updateCount += 1;

  if (cached._updateCount % 5 === 0) {
    await Driver.findByIdAndUpdate(driverId, {
      'currentLocation.lat': lat,
      'currentLocation.lng': lng,
    });
  }
};

/**
 * Get the last known location of a driver.
 * Falls back to DB if not in cache.
 */
const getDriverLocation = async (driverId) => {
  const cached = locationCache.get(driverId);
  if (cached) return { lat: cached.lat, lng: cached.lng, source: 'cache' };

  const driver = await Driver.findById(driverId).select('currentLocation');
  if (!driver) return null;
  return { lat: driver.currentLocation.lat, lng: driver.currentLocation.lng, source: 'db' };
};

/**
 * Get the driver assigned to an active booking.
 * Returns location for real-time tracking on user side.
 */
const getBookingDriverLocation = async (bookingId, userId) => {
  const booking = await MyBooking.findById(bookingId).populate('car');
  if (!booking) throw new Error('Booking not found.');
  if (booking.user.toString() !== userId.toString()) throw new Error('Not authorized.');
  if (!['Confirmed', 'In Progress'].includes(booking.status)) {
    throw new Error('Tracking is only available for active rides.');
  }

  const Driver = require('../models/driver');
  const driver = await Driver.findOne({ car: booking.car._id }).select('name phone currentLocation rating');
  if (!driver) return null;

  const location = await getDriverLocation(driver._id.toString());
  return { driver: { name: driver.name, phone: driver.phone, rating: driver.rating }, location };
};

/**
 * Remove stale location entries older than 10 minutes.
 * Call this on a schedule (e.g. setInterval in server.js).
 */
const cleanupStaleLocations = () => {
  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();
  for (const [id, data] of locationCache.entries()) {
    if (now - data.updatedAt > TEN_MINUTES) locationCache.delete(id);
  }
};

module.exports = {
  updateDriverLocation,
  getDriverLocation,
  getBookingDriverLocation,
  cleanupStaleLocations,
  locationCache,
};