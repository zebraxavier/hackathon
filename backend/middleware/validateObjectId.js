const mongoose = require('mongoose');

// Rejects requests whose :param is not a valid MongoDB ObjectId, so handlers
// return 400 instead of failing with a CastError deep inside a query.
const validateObjectId = (param = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return res.status(400).json({ success: false, message: `Invalid ${param}` });
  }
  next();
};

module.exports = { validateObjectId };
