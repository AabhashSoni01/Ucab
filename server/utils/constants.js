// ── Booking 
const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'Unpaid',
  PAID: 'Paid',
});

const PAYMENT_METHOD = Object.freeze({
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  WALLET: 'Wallet',
  NET_BANKING: 'NetBanking',
});

const PAYMENT_RESULT = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
});

// ── Car categories 
const CAR_CATEGORIES = Object.freeze(['Mini', 'Sedan', 'SUV', 'Luxury', 'Auto']);

// ── User roles 
const ROLES = Object.freeze({
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin',
});

// ── JWT 
const JWT_EXPIRES_IN = '7d';

// ── Pagination 
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

// ── File upload 
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── Fare 
const FARE = Object.freeze({
  BASE: 30,
  PER_KM: 12,
  PER_MINUTE: 1.5,
  TAX_RATE: 0.05,
  SURGE_MULTIPLIER: 1.3,
});

// ── HTTP status codes (convenience) 
const HTTP = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL: 500,
});

module.exports = {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_RESULT,
  CAR_CATEGORIES,
  ROLES,
  JWT_EXPIRES_IN,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_FILE_SIZE_MB,
  ALLOWED_IMAGE_TYPES,
  FARE,
  HTTP,
};