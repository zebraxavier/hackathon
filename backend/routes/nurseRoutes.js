const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, and documents are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// POST /api/nurse/upload-report - Upload patient report
router.post('/upload-report', protect, authorize('nurse', 'doctor'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const { patientId, reportType, title, description, testDate } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient ID and report title'
      });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const report = await Report.create({
      patientId,
      uploadedBy: req.user._id,
      reportType: reportType || 'lab',
      title,
      description,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      testDate: testDate || Date.now()
    });

    const populatedReport = await Report.findById(report._id)
      .populate('patientId', 'name email')
      .populate('uploadedBy', 'name role');

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      report: populatedReport
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload report'
    });
  }
});

// PUT /api/nurse/patient/:id/vitals - Update patient vitals
router.put('/patient/:id/vitals', protect, authorize('nurse', 'doctor'), async (req, res) => {
  try {
    const { bloodPressure, heartRate, temperature, weight, height } = req.body;

    const patient = await Patient.findOne({ userId: req.params.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    patient.vitals = {
      bloodPressure,
      heartRate,
      temperature,
      weight,
      height,
      lastUpdated: Date.now()
    };

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Vitals updated successfully',
      vitals: patient.vitals
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vitals'
    });
  }
});

// GET /api/nurse/patients - Get all patients
router.get('/patients', protect, authorize('nurse'), async (req, res) => {
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

// GET /api/nurse/reports - Get all reports uploaded by nurse
router.get('/reports', protect, authorize('nurse', 'doctor'), async (req, res) => {
  try {
    const reports = await Report.find({ uploadedBy: req.user._id })
      .populate('patientId', 'name email')
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);

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

module.exports = router;
