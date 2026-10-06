const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Report = require('../models/Report');
const Patient = require('../models/Patient');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { upload, removeFile } = require('../config/upload');

// POST /api/nurse/upload-report - Upload patient report
router.post('/upload-report', protect, authorize('nurse', 'doctor'), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  const { patientId, reportType, title, description, testDate } = req.body;

  const reject = (status, message) => {
    removeFile(req.file.path);
    return res.status(status).json({ success: false, message });
  };

  if (!patientId || !title || !String(title).trim()) {
    return reject(400, 'Please provide patient ID and report title');
  }

  if (!mongoose.isValidObjectId(patientId)) {
    return reject(400, 'Invalid patient ID');
  }

  const patient = await User.findById(patientId);
  if (!patient || patient.role !== 'patient') {
    return reject(404, 'Patient not found');
  }

  let report;
  try {
    report = await Report.create({
      patientId,
      uploadedBy: req.user._id,
      reportType: reportType || 'lab',
      title: String(title).trim(),
      description,
      fileName: path.basename(req.file.originalname),
      filePath: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      testDate: testDate || Date.now()
    });
  } catch (error) {
    removeFile(req.file.path);
    throw error;
  }

  const populatedReport = await Report.findById(report._id)
    .populate('patientId', 'name email')
    .populate('uploadedBy', 'name role');

  res.status(201).json({
    success: true,
    message: 'Report uploaded successfully',
    report: populatedReport
  });
}));

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : NaN;
};

// PUT /api/nurse/patient/:id/vitals - Update patient vitals
router.put('/patient/:id/vitals', protect, authorize('nurse', 'doctor'), validateObjectId(), asyncHandler(async (req, res) => {
  const { bloodPressure } = req.body;
  const numeric = {
    heartRate: toOptionalNumber(req.body.heartRate),
    temperature: toOptionalNumber(req.body.temperature),
    weight: toOptionalNumber(req.body.weight),
    height: toOptionalNumber(req.body.height)
  };

  const invalid = Object.keys(numeric).filter((key) => Number.isNaN(numeric[key]));
  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid value for: ${invalid.join(', ')}`
    });
  }

  if (bloodPressure !== undefined && bloodPressure !== '' && !/^\d{2,3}\/\d{2,3}$/.test(String(bloodPressure))) {
    return res.status(400).json({
      success: false,
      message: 'Blood pressure must be in the format 120/80'
    });
  }

  const patient = await Patient.findOne({ userId: req.params.id });
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  patient.vitals = {
    bloodPressure: bloodPressure || undefined,
    ...numeric,
    lastUpdated: Date.now()
  };

  await patient.save();

  res.status(200).json({
    success: true,
    message: 'Vitals updated successfully',
    vitals: patient.vitals
  });
}));

// GET /api/nurse/patients - Get all patients
router.get('/patients', protect, authorize('nurse'), asyncHandler(async (req, res) => {
  const patients = await User.find({ role: 'patient', isVerified: true }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: patients.length, patients });
}));

// GET /api/nurse/reports - Get recent reports uploaded by the current user
router.get('/reports', protect, authorize('nurse', 'doctor'), asyncHandler(async (req, res) => {
  const reports = await Report.find({ uploadedBy: req.user._id })
    .populate('patientId', 'name email')
    .populate('uploadedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({ success: true, count: reports.length, reports });
}));

module.exports = router;
