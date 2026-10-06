// Rejects request bodies and query strings containing MongoDB operator keys
// (e.g. {"email": {"$ne": null}}) to prevent NoSQL injection.
const hasOperatorKey = (value, depth = 0) => {
  if (depth > 10 || value === null || typeof value !== 'object') return false;

  return Object.keys(value).some(
    (key) => key.startsWith('$') || key.includes('.') || hasOperatorKey(value[key], depth + 1)
  );
};

const rejectMongoOperators = (req, res, next) => {
  if (hasOperatorKey(req.body) || hasOperatorKey(req.query)) {
    return res.status(400).json({ success: false, message: 'Invalid characters in request' });
  }
  next();
};

module.exports = { rejectMongoOperators, hasOperatorKey };
