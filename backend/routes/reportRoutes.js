const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reports/:id - Get specific report
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('uploadedBy', 'name role');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && report.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
});

module.exports = router;
