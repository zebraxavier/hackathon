const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET /api/patient/dashboard - Patient dashboard
router.get('/dashboard', protect, authorize('patient'), async (req, res) => {
  try {
    const patientDetails = await Patient.findOne({ userId: req.user._id });
    
    const upcomingAppointments = await Appointment.find({
      patientId: req.user._id,
      appointmentDate: { $gte: new Date() },
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
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// GET /api/patient/reports - Get patient reports
router.get('/reports', protect, authorize('patient'), async (req, res) => {
  try {
    const reports = await Report.find({ patientId: req.user._id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// GET /api/patient/medical-history - Get medical history
router.get('/medical-history', protect, authorize('patient'), async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical history'
    });
  }
});

// GET /api/patient/doctors - Get list of doctors
router.get('/doctors', protect, authorize('patient'), async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isVerified: true })
      .select('name email phone')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors'
    });
  }
});

module.exports = router;
