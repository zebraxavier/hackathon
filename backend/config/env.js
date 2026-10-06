// Centralised environment configuration.
// Fails fast at startup when a required variable is missing so a misconfigured
// deployment never starts serving traffic.

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET'];

const isProduction = () => process.env.NODE_ENV === 'production';
const isTest = () => process.env.NODE_ENV === 'test';

const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProduction() && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
};

// Comma-separated list of allowed browser origins, e.g.
// FRONTEND_URL=https://clinic.example.com,https://www.clinic.example.com
const getAllowedOrigins = () => {
  const configured = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (isProduction()) return configured;

  return [...configured, 'http://localhost:5173', 'http://127.0.0.1:5173'];
};

module.exports = { validateEnv, isProduction, isTest, getAllowedOrigins };
