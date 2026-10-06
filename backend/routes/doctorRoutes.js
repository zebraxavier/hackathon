const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { DAY_MS, startOfUTCDay } = require('../utils/dates');
const { authorize } = require('../middleware/roleMiddleware');

// GET /api/doctor/patients - Get all patients
router.get('/patients', protect, authorize('doctor'), asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient', isVerified: true })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: patients.length,
    patients
  });
}));

// GET /api/doctor/patient/:id - Get patient details
router.get('/patient/:id', protect, authorize('doctor'), validateObjectId(), asyncHandler(async (req, res) => {
  const patient = await User.findById(req.params.id);

  if (!patient || patient.role !== 'patient') {
    return res.status(404).json({
      success: false,
      message: 'Patient not found'
    });
  }

  const [patientDetails, reports, appointments] = await Promise.all([
    Patient.findOne({ userId: patient._id }),
    Report.find({ patientId: patient._id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 }),
    Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name')
      .sort({ appointmentDate: -1 })
  ]);

  res.status(200).json({
    success: true,
    patient,
    patientDetails,
    reports,
    appointments
  });
}));

// GET /api/doctor/dashboard - Doctor dashboard stats
router.get('/dashboard', protect, authorize('doctor'), asyncHandler(async (req, res) => {
  const startOfDay = startOfUTCDay();
  const endOfDay = new Date(startOfDay.getTime() + DAY_MS);

  const [totalPatients, todayAppointments, totalReports, recentAppointments] = await Promise.all([
    User.countDocuments({ role: 'patient', isVerified: true }),
    Appointment.countDocuments({
      doctorId: req.user._id,
      status: { $ne: 'cancelled' },
      appointmentDate: { $gte: startOfDay, $lt: endOfDay }
    }),
    Report.countDocuments({}),
    Appointment.find({
      doctorId: req.user._id,
      status: 'scheduled',
      appointmentDate: { $gte: startOfDay }
    })
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: 1 })
      .limit(5)
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalPatients,
      todayAppointments,
      totalReports
    },
    recentAppointments
  });
}));

module.exports = router;
