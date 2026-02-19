const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
const { generateToken } = require('../utils/token');
const {
  otpRegistrationLimiter,
  otpVerificationLimiter,
  loginLimiter
} = require('../middleware/rateLimitMiddleware');

// POST /api/auth/register - Register new patient
router.post('/register', otpRegistrationLimiter, async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address,
      role: 'patient',
      otp,
      otpExpiry,
      isVerified: false
    });

    // Create patient profile
    await Patient.create({
      userId: user._id
    });

    // Send OTP email
    await sendOTPEmail(email, otp);

    // DEVELOPMENT: Log OTP to console for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for OTP verification.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
});

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', otpVerificationLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // DEVELOPMENT: Accept test OTP for easy testing
    const isTestOTP = process.env.NODE_ENV === 'development' && otp === '123456';
    
    // Check if OTP matches and not expired
    if (!isTestOTP && user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (!isTestOTP && user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `You are not authorized as ${role}`
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
