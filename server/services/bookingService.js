/**
 * matchService.js
 * Finds the nearest available driver/car for a booking request.
 */

const Driver = require('../models/driver');

/**
 * Calculate distance between two lat/lng points using Haversine formula.
 * @returns distance in kilometres
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Find nearest available drivers within a given radius.
 * @param {number} pickupLat
 * @param {number} pickupLng
 * @param {string} [category] - Optional car category filter
 * @param {number} [radiusKm=10] - Search radius in km
 * @returns {Array} Sorted list of nearby drivers with distance
 */
const findNearbyDrivers = async (pickupLat, pickupLng, category = null, radiusKm = 10) => {
  const query = { isAvailable: true, isActive: true, isVerified: true };

  const drivers = await Driver.find(query).populate('car', 'name model category plateNumber seats pricePerKm');

  // Filter by category if specified
  const filtered = category
    ? drivers.filter((d) => d.car && d.car.category === category)
    : drivers.filter((d) => d.car);

  // Calculate distance for each driver
  const withDistance = filtered.map((driver) => {
    const dist = haversineDistance(
      pickupLat, pickupLng,
      driver.currentLocation.lat || 0,
      driver.currentLocation.lng || 0
    );
    return { driver, distanceKm: parseFloat(dist.toFixed(2)) };
  });

  // Filter by radius and sort by distance
  return withDistance
    .filter((d) => d.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
};

/**
 * Assign best matching driver to a booking.
 * Falls back to any available driver if none found within radius.
 * @param {Object} booking - Booking document
 * @param {number} [pickupLat]
 * @param {number} [pickupLng]
 * @returns {Object|null} Matched driver or null
 */
const matchDriver = async (booking, pickupLat = 0, pickupLng = 0) => {
  try {
    const Car = require('../models/car');
    const car = await Car.findById(booking.car);
    const category = car?.category || null;

    // Try within 10km first
    let nearby = await findNearbyDrivers(pickupLat, pickupLng, category, 10);

    // Expand to 25km if no results
    if (!nearby.length) {
      nearby = await findNearbyDrivers(pickupLat, pickupLng, category, 25);
    }

    // Fall back to any available driver with matching car
    if (!nearby.length) {
      nearby = await findNearbyDrivers(0, 0, category, Infinity);
    }

    if (!nearby.length) return null;

    const { driver } = nearby[0];

    // Mark driver as unavailable during the ride
    await Driver.findByIdAndUpdate(driver._id, { isAvailable: false });

    return driver;
  } catch (err) {
    console.error('matchDriver error:', err.message);
    return null;
  }
};

module.exports = { matchDriver, findNearbyDrivers, haversineDistance };