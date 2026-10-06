const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

// GET /api/profile - Get user profile
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get patient details if user is a patient
  let patientDetails = null;
  if (user.role === 'patient') {
    patientDetails = await Patient.findOne({ userId: user._id });
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      createdAt: user.createdAt
    },
    patientDetails
  });
}));

// PUT /api/profile/update - Update user profile
router.put('/update', protect, asyncHandler(async (req, res) => {
  const { name, phone, address, dateOfBirth, gender } = req.body;

  const updateData = {};
  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty' });
  }
  if (name) updateData.name = String(name).trim();
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (gender) updateData.gender = gender;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender
    }
  });
}));

// PUT /api/profile/password - Change password (requires the current password)
router.put('/password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide your current and new password' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
}));

module.exports = router;
