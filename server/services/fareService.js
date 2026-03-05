/**
 * fareService.js
 * Centralized fare calculation logic for UCab.
 */

const BASE_FARE = 30;          // Fixed base charge (₹)
const PER_KM_RATE = 12;        // Default rate if no car rate provided (₹/km)
const PER_MINUTE_RATE = 1.5;   // Waiting/time charge (₹/min)
const TAX_RATE = 0.05;         // 5% GST
const SURGE_THRESHOLD = 0.8;   // 80% driver availability triggers surge
const SURGE_MULTIPLIER = 1.3;  // 30% surge increase

/**
 * Calculate fare for a ride.
 * @param {Object} options
 * @param {number} options.distanceKm - Distance in kilometres
 * @param {number} [options.durationMin=0] - Estimated ride duration in minutes
 * @param {number} [options.pricePerKm] - Car-specific rate (overrides PER_KM_RATE)
 * @param {boolean} [options.isSurge=false] - Whether surge pricing is active
 * @param {number} [options.discount=0] - Flat discount amount (₹)
 * @returns {Object} Fare breakdown
 */
const calculateFare = ({
  distanceKm,
  durationMin = 0,
  pricePerKm = PER_KM_RATE,
  isSurge = false,
  discount = 0,
}) => {
  if (!distanceKm || distanceKm <= 0) {
    return {
      baseFare: BASE_FARE,
      distanceCharge: 0,
      timeCharge: 0,
      subtotal: BASE_FARE,
      surgeMultiplier: 1,
      discount: 0,
      taxAmount: parseFloat((BASE_FARE * TAX_RATE).toFixed(2)),
      totalFare: parseFloat((BASE_FARE + BASE_FARE * TAX_RATE).toFixed(2)),
    };
  }

  const distanceCharge = parseFloat((distanceKm * pricePerKm).toFixed(2));
  const timeCharge = parseFloat((durationMin * PER_MINUTE_RATE).toFixed(2));
  const surgeMultiplier = isSurge ? SURGE_MULTIPLIER : 1;

  const subtotal = parseFloat(
    ((BASE_FARE + distanceCharge + timeCharge) * surgeMultiplier).toFixed(2)
  );

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const taxAmount = parseFloat((discountedSubtotal * TAX_RATE).toFixed(2));
  const totalFare = parseFloat((discountedSubtotal + taxAmount).toFixed(2));

  return {
    baseFare: BASE_FARE,
    distanceCharge,
    timeCharge,
    surgeMultiplier,
    subtotal,
    discount: parseFloat(discount.toFixed(2)),
    taxAmount,
    totalFare,
  };
};

/**
 * Estimate fare range without exact distance.
 * Used on the booking form before route confirmation.
 */
const estimateFareRange = (pricePerKm = PER_KM_RATE) => {
  const min = calculateFare({ distanceKm: 3, pricePerKm });
  const max = calculateFare({ distanceKm: 15, pricePerKm });
  return { minFare: min.totalFare, maxFare: max.totalFare };
};

/**
 * Determine if surge pricing should apply based on available driver ratio.
 * @param {number} availableDrivers
 * @param {number} totalDrivers
 * @returns {boolean}
 */
const isSurgePricing = (availableDrivers, totalDrivers) => {
  if (!totalDrivers) return false;
  return availableDrivers / totalDrivers < (1 - SURGE_THRESHOLD);
};

module.exports = { calculateFare, estimateFareRange, isSurgePricing, BASE_FARE, PER_KM_RATE, TAX_RATE };