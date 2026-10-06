const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const { generateOTP, hashOTP, sendOTPEmail, OTP_TTL_MINUTES } = require('../utils/sendOTP');
const { generateToken } = require('../utils/token');
const {
  otpRegistrationLimiter,
  otpVerificationLimiter,
  loginLimiter
} = require('../middleware/rateLimitMiddleware');

const MAX_OTP_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const normalizeEmail = (email) => email.trim().toLowerCase();

const toAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

// POST /api/auth/register - Register new patient (or resend OTP to an unverified account)
router.post('/register', otpRegistrationLimiter, asyncHandler(async (req, res) => {
  const { name, email, password, phone, dateOfBirth, gender, address } = req.body;

  if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and password'
    });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    });
  }

  const normalizedEmail = normalizeEmail(email);
  const otp = generateOTP();
  const profile = {
    name: name.trim(),
    password,
    phone,
    dateOfBirth: dateOfBirth || undefined,
    gender: gender || undefined,
    address,
    otp: hashOTP(otp),
    otpExpiry: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    otpAttempts: 0
  };

  let user = await User.findOne({ email: normalizedEmail });

  if (user && user.isVerified) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  if (user) {
    // Unverified account: let the user retry registration instead of being locked out.
    user.set(profile);
    await user.save();
  } else {
    user = await User.create({ ...profile, email: normalizedEmail, role: 'patient', isVerified: false });
    await Patient.create({ userId: user._id });
  }

  const sent = await sendOTPEmail(normalizedEmail, otp);
  if (!sent) {
    return res.status(502).json({
      success: false,
      message: 'Could not send verification email. Please try again later.'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for OTP verification.',
    userId: user._id
  });
}));

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', otpVerificationLimiter, asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(otp)) {
    return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+otp +otpExpiry +otpAttempts');

  if (!user || user.isVerified || !user.otp) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({
      success: false,
      message: 'Too many incorrect attempts. Please register again to get a new OTP.'
    });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({ success: false, message: 'OTP has expired. Please register again.' });
  }

  if (user.otp !== hashOTP(otp.trim())) {
    user.otpAttempts += 1;
    await user.save();
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  user.otpAttempts = 0;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    token: generateToken(user._id, user.role),
    user: toAuthUser(user)
  });
}));

// POST /api/auth/login - Login user
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');

  // Check the password before anything else so responses don't reveal which emails exist.
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(401).json({ success: false, message: 'Please verify your email first' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ success: false, message: `You are not authorized as ${role}` });
  }

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token: generateToken(user._id, user.role),
    user: toAuthUser(user)
  });
}));

// POST /api/auth/logout - Stateless JWT: the client discards its token.
router.post('/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' });
});

module.exports = router;
