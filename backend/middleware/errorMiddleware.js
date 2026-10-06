const multer = require('multer');
const { isProduction } = require('../config/env');

// Global error handler middleware
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' });
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large (max 10MB)'
      : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation Error', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid ${err.path}` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'Field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const statusCode = err.statusCode || 500;

  // Only log unexpected errors; 4xx raised on purpose are not noise-worthy.
  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    // Never leak internal error details to clients in production.
    message: statusCode >= 500 && isProduction() ? 'Server Error' : (err.message || 'Server Error')
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = { errorHandler, notFound };
