const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    enum: ['lab', 'radiology', 'prescription', 'discharge', 'other'],
    default: 'lab',
    set: function(value) {
      // Normalize reportType to lowercase and handle common variations
      if (!value) return 'lab';
      const normalized = value.toLowerCase().trim();
      
      // Map common variations to valid enum values
      const typeMap = {
        'lab report': 'lab',
        'lab': 'lab',
        'laboratory': 'lab',
        'radiology': 'radiology',
        'x-ray': 'radiology',
        'xray': 'radiology',
        'scan': 'radiology',
        'prescription': 'prescription',
        'rx': 'prescription',
        'discharge': 'discharge',
        'discharge summary': 'discharge',
        'other': 'other'
      };
      
      return typeMap[normalized] || 'other';
    }
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: Number,
  mimeType: String,
  testDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
