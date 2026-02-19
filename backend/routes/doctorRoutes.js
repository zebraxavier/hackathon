const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET /api/doctor/patients - Get all patients
router.get('/patients', protect, authorize('doctor'), async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient', isVerified: true })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// GET /api/doctor/patient/:id - Get patient details
router.get('/patient/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const patientDetails = await Patient.findOne({ userId: patient._id });
    const reports = await Report.find({ patientId: patient._id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });
    
    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      patient,
      patientDetails,
      reports,
      appointments
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details'
    });
  }
});

// GET /api/doctor/dashboard - Doctor dashboard stats
router.get('/dashboard', protect, authorize('doctor'), async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient', isVerified: true });
    const todayAppointments = await Appointment.countDocuments({
      doctorId: req.user._id,
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    const recentAppointments = await Appointment.find({ doctorId: req.user._id })
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        todayAppointments
      },
      recentAppointments
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

module.exports = router;
