const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, setup, teardown, resetDb, createUser, auth, sentOTPs } = require('./helpers');
const User = require('../models/User');

const registration = {
  name: 'Jane Patient',
  email: 'Jane@Example.com',
  password: 'secret123',
  phone: '555-0100'
};

describe('auth', () => {
  before(setup);
  after(teardown);
  beforeEach(resetDb);

  it('registers a patient, stores a hashed OTP and normalises the email', async () => {
    const res = await request(app).post('/api/auth/register').send(registration);
    assert.equal(res.status, 201);

    const otp = sentOTPs['jane@example.com'];
    assert.match(otp, /^\d{6}$/);

    const user = await User.findOne({ email: 'jane@example.com' }).select('+otp +password');
    assert.equal(user.role, 'patient');
    assert.equal(user.isVerified, false);
    assert.notEqual(user.otp, otp, 'OTP must not be stored in plain text');
    assert.notEqual(user.password, registration.password, 'password must be hashed');
  });

  it('rejects missing fields, bad email and short passwords', async () => {
    for (const body of [
      { email: 'a@b.com', password: 'secret123' },
      { ...registration, email: 'not-an-email' },
      { ...registration, password: '123' }
    ]) {
      const res = await request(app).post('/api/auth/register').send(body);
      assert.equal(res.status, 400, JSON.stringify(body));
    }
  });

  it('ignores a client-supplied role on registration', async () => {
    await request(app).post('/api/auth/register').send({ ...registration, role: 'doctor' });
    const user = await User.findOne({ email: 'jane@example.com' });
    assert.equal(user.role, 'patient');
  });

  it('verifies the OTP and returns a token', async () => {
    await request(app).post('/api/auth/register').send(registration);
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: registration.email, otp: sentOTPs['jane@example.com'] });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'patient');
    assert.equal(res.body.user.password, undefined);
  });

  it('locks verification after 5 wrong OTPs', async () => {
    await request(app).post('/api/auth/register').send(registration);
    const correct = sentOTPs['jane@example.com'];
    const wrong = correct === '111111' ? '222222' : '111111';

    for (let i = 0; i < 5; i += 1) {
      const res = await request(app).post('/api/auth/verify-otp').send({ email: registration.email, otp: wrong });
      assert.equal(res.status, 400);
    }

    const locked = await request(app).post('/api/auth/verify-otp').send({ email: registration.email, otp: correct });
    assert.equal(locked.status, 429);
  });

  it('lets an unverified user register again to get a fresh OTP', async () => {
    await request(app).post('/api/auth/register').send(registration);
    const first = sentOTPs['jane@example.com'];

    const again = await request(app).post('/api/auth/register').send(registration);
    assert.equal(again.status, 201);
    assert.equal(await User.countDocuments({ email: 'jane@example.com' }), 1);

    if (first !== sentOTPs['jane@example.com']) {
      const stale = await request(app).post('/api/auth/verify-otp').send({ email: registration.email, otp: first });
      assert.equal(stale.status, 400);
    }
  });

  it('rejects registering an already verified email', async () => {
    await createUser('patient', { email: 'jane@example.com' });
    const res = await request(app).post('/api/auth/register').send(registration);
    assert.equal(res.status, 409);
  });

  it('logs in with valid credentials and enforces role', async () => {
    await createUser('doctor', { email: 'doc@test.com' });

    const ok = await request(app).post('/api/auth/login').send({ email: 'DOC@test.com', password: 'password123', role: 'doctor' });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.token);

    const wrongRole = await request(app).post('/api/auth/login').send({ email: 'doc@test.com', password: 'password123', role: 'patient' });
    assert.equal(wrongRole.status, 403);

    const wrongPassword = await request(app).post('/api/auth/login').send({ email: 'doc@test.com', password: 'nope' });
    assert.equal(wrongPassword.status, 401);
  });

  it('does not reveal unverified accounts to wrong passwords', async () => {
    await request(app).post('/api/auth/register').send(registration);
    const res = await request(app).post('/api/auth/login').send({ email: registration.email, password: 'wrong-password' });
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid credentials');
  });

  it('blocks NoSQL operator injection in login', async () => {
    await createUser('doctor');
    const res = await request(app).post('/api/auth/login').send({ email: { $ne: null }, password: { $ne: null } });
    assert.equal(res.status, 400);

    const nested = await request(app).post('/api/auth/verify-otp').send({ email: 'a@b.com', otp: { $gt: '' } });
    assert.equal(nested.status, 400);
  });

  it('rejects requests without or with an invalid token', async () => {
    assert.equal((await request(app).get('/api/profile')).status, 401);
    assert.equal((await request(app).get('/api/profile').set(auth('garbage'))).status, 401);
  });

  it('returns the profile without sensitive fields', async () => {
    const { token } = await createUser('patient');
    const res = await request(app).get('/api/profile').set(auth(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.user.password, undefined);
    assert.ok(res.body.patientDetails);
  });

  it('changes the password only with the correct current password', async () => {
    const { user, token } = await createUser('patient', { email: 'pw@test.com' });

    const wrong = await request(app).put('/api/profile/password').set(auth(token))
      .send({ currentPassword: 'nope', newPassword: 'brandnew1' });
    assert.equal(wrong.status, 400, 'must not be 401, which the client treats as session expiry');

    const ok = await request(app).put('/api/profile/password').set(auth(token))
      .send({ currentPassword: 'password123', newPassword: 'brandnew1' });
    assert.equal(ok.status, 200);

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: 'brandnew1' });
    assert.equal(login.status, 200);
  });
});
