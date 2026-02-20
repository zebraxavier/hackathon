// Rate limiting middleware to prevent OTP abuse
const rateLimit = require('express-rate-limit');

// Rate limiter for OTP registration requests
const otpRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per window per IP (increased for testing)
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development/test environment
  skip: (req) => process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
});

// Rate limiter for OTP verification requests
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 verification attempts per window per IP
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

// Rate limiter for login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login attempts per window per IP
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test'
});

module.exports = {
  otpRegistrationLimiter,
  otpVerificationLimiter,
  loginLimiter,
  apiLimiter
};
