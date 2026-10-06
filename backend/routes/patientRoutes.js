const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { startOfUTCDay } = require('../utils/dates');

// GET /api/patient/dashboard - Patient dashboard
router.get('/dashboard', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const patientDetails = await Patient.findOne({ userId: req.user._id });
  
  const upcomingAppointments = await Appointment.find({
    patientId: req.user._id,
    appointmentDate: { $gte: startOfUTCDay() },
    status: 'scheduled'
  })
    .populate('doctorId', 'name email')
    .sort({ appointmentDate: 1 })
    .limit(5);

  const recentReports = await Report.find({ patientId: req.user._id })
    .populate('uploadedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    patientDetails,
    upcomingAppointments,
    recentReports
  });
}));

// GET /api/patient/reports - Get patient reports
router.get('/reports', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const reports = await Report.find({ patientId: req.user._id })
    .populate('uploadedBy', 'name role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reports.length,
    reports
  });
}));

// GET /api/patient/medical-history - Get medical history
router.get('/medical-history', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const patientDetails = await Patient.findOne({ userId: req.user._id });

  if (!patientDetails) {
    return res.status(404).json({
      success: false,
      message: 'Patient details not found'
    });
  }

  res.status(200).json({
    success: true,
    medicalHistory: patientDetails.medicalHistory,
    allergies: patientDetails.allergies,
    medications: patientDetails.medications,
    vitals: patientDetails.vitals
  });
}));

// GET /api/patient/doctors - Get list of doctors
router.get('/doctors', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor', isVerified: true })
    .select('name email phone')
    .sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: doctors.length,
    doctors
  });
}));

module.exports = router;
