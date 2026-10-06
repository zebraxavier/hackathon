const fs = require('fs');
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { resolveStoredFile } = require('../config/upload');

// Patients may only access their own reports; clinical staff may access any.
const canAccessReport = (user, report) =>
  user.role !== 'patient' || String(report.patientId._id || report.patientId) === String(user._id);

// GET /api/reports/:id - Get specific report metadata
router.get('/:id', protect, validateObjectId(), asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id)
    .populate('patientId', 'name email')
    .populate('uploadedBy', 'name role');

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  if (!canAccessReport(req.user, report)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
  }

  res.status(200).json({ success: true, report });
}));

// GET /api/reports/:id/download - Download the report file (authenticated)
router.get('/:id/download', protect, validateObjectId(), asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    return res.status(404).json({ success: false, message: 'Report not found' });
  }

  if (!canAccessReport(req.user, report)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
  }

  const filePath = resolveStoredFile(report.filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Report file is no longer available' });
  }

  res.setHeader('Cache-Control', 'private, no-store');
  res.download(filePath, report.fileName);
}));

module.exports = router;
