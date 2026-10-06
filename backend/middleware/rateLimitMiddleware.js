// Rate limiting middleware to prevent brute force and OTP abuse
const rateLimit = require('express-rate-limit');

const skipInTests = () => process.env.NODE_ENV === 'test';

const createLimiter = (max, message) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTests
});

const otpRegistrationLimiter = createLimiter(
  10,
  'Too many registration attempts. Please try again after 15 minutes.'
);

const otpVerificationLimiter = createLimiter(
  10,
  'Too many verification attempts. Please try again after 15 minutes.'
);

const loginLimiter = createLimiter(
  10,
  'Too many login attempts. Please try again after 15 minutes.'
);

const apiLimiter = createLimiter(
  300,
  'Too many requests. Please try again later.'
);

module.exports = {
  otpRegistrationLimiter,
  otpVerificationLimiter,
  loginLimiter,
  apiLimiter
};
