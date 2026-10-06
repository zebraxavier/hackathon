// Shared test harness: in-memory MongoDB, isolated upload dir, captured OTPs.
const os = require('os');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-validation';
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'clinic-uploads-'));
delete process.env.AI_API_KEY;
delete process.env.GROQ_API_KEY;

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Capture OTPs instead of emailing them. Must be patched before routes load.
const sentOTPs = {};
const otpUtils = require('../utils/sendOTP');
otpUtils.sendOTPEmail = async (email, otp) => {
  sentOTPs[email] = otp;
  return true;
};

const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateToken } = require('../utils/token');

let mongod;

const setup = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
};

const teardown = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

process.on('exit', () => {
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

const resetDb = async () => {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
  Object.keys(sentOTPs).forEach((key) => delete sentOTPs[key]);
};

// Creates a verified user and returns it with a bearer token.
const createUser = async (role, overrides = {}) => {
  const user = await User.create({
    name: `Test ${role}`,
    email: `${role}-${new mongoose.Types.ObjectId()}@test.com`,
    password: 'password123',
    role,
    isVerified: true,
    ...overrides
  });
  if (role === 'patient') await Patient.create({ userId: user._id });
  return { user, token: generateToken(user._id, user.role) };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { app, request, setup, teardown, resetDb, createUser, auth, sentOTPs };
