const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// Absolute path so uploads work regardless of the directory the server is started from.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${crypto.randomUUID()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ALLOWED_TYPES[ext];

  if (allowedMimeTypes && allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  const error = new Error('Only PDF, JPG, PNG, DOC and DOCX files are allowed');
  error.statusCode = 400;
  cb(error);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter
});

// Stored paths are relative to UPLOAD_DIR; older records may hold "uploads/<name>"
// or Windows-style paths, so only the base name is trusted.
const resolveStoredFile = (storedPath) => path.join(UPLOAD_DIR, path.basename(String(storedPath).replace(/\\/g, '/')));

const removeFile = (filePath) => {
  fs.promises.unlink(filePath).catch(() => {});
};

module.exports = { upload, UPLOAD_DIR, resolveStoredFile, removeFile };
