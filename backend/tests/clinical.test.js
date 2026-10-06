const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, setup, teardown, resetDb, createUser, auth } = require('./helpers');
const Appointment = require('../models/Appointment');

const PDF = Buffer.from('%PDF-1.4\n%test report\n');

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

describe('role-based access', () => {
  before(setup);
  after(teardown);
  beforeEach(resetDb);

  it('keeps each role inside its own routes', async () => {
    const patient = await createUser('patient');
    const nurse = await createUser('nurse');
    const doctor = await createUser('doctor');

    assert.equal((await request(app).get('/api/doctor/patients').set(auth(patient.token))).status, 403);
    assert.equal((await request(app).get('/api/doctor/patients').set(auth(nurse.token))).status, 403);
    assert.equal((await request(app).get('/api/nurse/patients').set(auth(patient.token))).status, 403);
    assert.equal((await request(app).get('/api/patient/dashboard').set(auth(doctor.token))).status, 403);

    const list = await request(app).get('/api/doctor/patients').set(auth(doctor.token));
    assert.equal(list.status, 200);
    assert.equal(list.body.count, 1);
    assert.equal(list.body.patients[0].password, undefined);
  });

  it('returns 400 for malformed ids instead of crashing', async () => {
    const doctor = await createUser('doctor');
    const res = await request(app).get('/api/doctor/patient/not-an-id').set(auth(doctor.token));
    assert.equal(res.status, 400);
  });

  it('returns patient details for doctors', async () => {
    const doctor = await createUser('doctor');
    const patient = await createUser('patient');
    const res = await request(app).get(`/api/doctor/patient/${patient.user._id}`).set(auth(doctor.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.patient.email, patient.user.email);
    assert.deepEqual(res.body.reports, []);
  });
});

describe('appointments', () => {
  before(setup);
  after(teardown);
  beforeEach(resetDb);

  it('books, prevents double booking and rejects past dates', async () => {
    const patient = await createUser('patient');
    const doctor = await createUser('doctor');
    const body = { doctorId: doctor.user._id, appointmentDate: tomorrow(), appointmentTime: '10:30', reason: 'Checkup' };

    const booked = await request(app).post('/api/appointments/book').set(auth(patient.token)).send(body);
    assert.equal(booked.status, 201);

    const duplicate = await request(app).post('/api/appointments/book').set(auth(patient.token)).send(body);
    assert.equal(duplicate.status, 409);

    const past = await request(app).post('/api/appointments/book').set(auth(patient.token))
      .send({ ...body, appointmentDate: '2020-01-01' });
    assert.equal(past.status, 400);

    const badTime = await request(app).post('/api/appointments/book').set(auth(patient.token))
      .send({ ...body, appointmentTime: '99:99' });
    assert.equal(badTime.status, 400);
  });

  it('rejects booking with a non-doctor id', async () => {
    const patient = await createUser('patient');
    const nurse = await createUser('nurse');
    const res = await request(app).post('/api/appointments/book').set(auth(patient.token))
      .send({ doctorId: nurse.user._id, appointmentDate: tomorrow(), appointmentTime: '10:00', reason: 'x' });
    assert.equal(res.status, 404);
  });

  it('only lets the assigned doctor update an appointment', async () => {
    const patient = await createUser('patient');
    const doctor = await createUser('doctor');
    const otherDoctor = await createUser('doctor');
    const appointment = await Appointment.create({
      patientId: patient.user._id,
      doctorId: doctor.user._id,
      appointmentDate: tomorrow(),
      appointmentTime: '09:00',
      reason: 'Follow-up'
    });

    const forbidden = await request(app).put(`/api/appointments/${appointment._id}`)
      .set(auth(otherDoctor.token)).send({ status: 'completed' });
    assert.equal(forbidden.status, 403);

    const invalid = await request(app).put(`/api/appointments/${appointment._id}`)
      .set(auth(doctor.token)).send({ status: 'bogus' });
    assert.equal(invalid.status, 400);

    const ok = await request(app).put(`/api/appointments/${appointment._id}`)
      .set(auth(doctor.token)).send({ status: 'completed', notes: 'All good' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.appointment.status, 'completed');
    assert.equal(ok.body.appointment.reason, 'Follow-up', 'untouched fields must be preserved');
  });

  it('shows today and future appointments on both dashboards', async () => {
    const patient = await createUser('patient');
    const doctor = await createUser('doctor');
    const today = new Date().toISOString().slice(0, 10);
    for (const [date, time] of [[today, '16:00'], [tomorrow(), '09:00']]) {
      const res = await request(app).post('/api/appointments/book').set(auth(patient.token))
        .send({ doctorId: doctor.user._id, appointmentDate: date, appointmentTime: time, reason: 'Visit' });
      assert.equal(res.status, 201);
    }

    const patientDash = await request(app).get('/api/patient/dashboard').set(auth(patient.token));
    assert.equal(patientDash.status, 200);
    assert.equal(patientDash.body.upcomingAppointments.length, 2);

    const doctorDash = await request(app).get('/api/doctor/dashboard').set(auth(doctor.token));
    assert.equal(doctorDash.status, 200);
    assert.equal(doctorDash.body.stats.totalPatients, 1);
    assert.equal(doctorDash.body.stats.todayAppointments, 1);
    assert.equal(doctorDash.body.recentAppointments.length, 2);
  });

  it('scopes appointment lists to the requesting patient', async () => {
    const alice = await createUser('patient');
    const bob = await createUser('patient');
    const doctor = await createUser('doctor');
    await Appointment.create({
      patientId: alice.user._id, doctorId: doctor.user._id,
      appointmentDate: tomorrow(), appointmentTime: '09:00', reason: 'Alice'
    });

    const res = await request(app).get('/api/appointments').set(auth(bob.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 0);
  });
});

describe('reports', () => {
  before(setup);
  after(teardown);
  beforeEach(resetDb);

  const upload = (token, patientId, file = PDF, filename = 'blood.pdf', contentType = 'application/pdf') =>
    request(app).post('/api/nurse/upload-report').set(auth(token))
      .field('patientId', String(patientId))
      .field('title', 'Blood test')
      .field('reportType', 'Lab Report')
      .attach('file', file, { filename, contentType });

  it('uploads a report and only lets the owner patient download it', async () => {
    const nurse = await createUser('nurse');
    const owner = await createUser('patient');
    const stranger = await createUser('patient');

    const created = await upload(nurse.token, owner.user._id);
    assert.equal(created.status, 201);
    assert.equal(created.body.report.reportType, 'lab');
    const reportId = created.body.report._id;

    const download = await request(app).get(`/api/reports/${reportId}/download`).set(auth(owner.token));
    assert.equal(download.status, 200);
    assert.equal(download.headers['content-type'], 'application/pdf');

    const denied = await request(app).get(`/api/reports/${reportId}/download`).set(auth(stranger.token));
    assert.equal(denied.status, 403);

    const anonymous = await request(app).get(`/api/reports/${reportId}/download`);
    assert.equal(anonymous.status, 401);

    const patientReports = await request(app).get('/api/patient/reports').set(auth(owner.token));
    assert.equal(patientReports.body.count, 1);
  });

  it('does not expose uploads as public static files', async () => {
    const res = await request(app).get('/uploads/anything.pdf');
    assert.equal(res.status, 404);
  });

  it('rejects disallowed file types and unknown patients', async () => {
    const nurse = await createUser('nurse');
    const patient = await createUser('patient');

    const exe = await upload(nurse.token, patient.user._id, Buffer.from('MZ'), 'virus.exe', 'application/octet-stream');
    assert.equal(exe.status, 400);

    const unknown = await upload(nurse.token, '64b7f0f0f0f0f0f0f0f0f0f0');
    assert.equal(unknown.status, 404);

    const patientUpload = await upload(patient.token, patient.user._id);
    assert.equal(patientUpload.status, 403);
  });

  it('validates vitals', async () => {
    const nurse = await createUser('nurse');
    const patient = await createUser('patient');
    const url = `/api/nurse/patient/${patient.user._id}/vitals`;

    const bad = await request(app).put(url).set(auth(nurse.token)).send({ heartRate: 'fast' });
    assert.equal(bad.status, 400);

    const badBp = await request(app).put(url).set(auth(nurse.token)).send({ bloodPressure: 'high' });
    assert.equal(badBp.status, 400);

    const ok = await request(app).put(url).set(auth(nurse.token)).send({ heartRate: 72, bloodPressure: '120/80' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.vitals.heartRate, 72);
  });
});

describe('chatbot and platform', () => {
  before(setup);
  after(teardown);
  beforeEach(resetDb);

  it('falls back safely when the AI provider is not configured', async () => {
    const patient = await createUser('patient');
    const res = await request(app).post('/api/chatbot/send').set(auth(patient.token)).send({ message: 'Severe bleeding from my arm' });
    assert.equal(res.status, 200);
    assert.equal(res.body.isEmergency, true);
    assert.equal(res.body.aiPowered, false);
    assert.match(res.body.reply, /emergenc/i);
  });

  it('validates chat messages and returns history oldest-first', async () => {
    const patient = await createUser('patient');
    assert.equal((await request(app).post('/api/chatbot/send').set(auth(patient.token)).send({ message: '  ' })).status, 400);
    assert.equal((await request(app).post('/api/chatbot/send').set(auth(patient.token)).send({ message: 'x'.repeat(1001) })).status, 400);

    await request(app).post('/api/chatbot/send').set(auth(patient.token)).send({ message: 'first' });
    await request(app).post('/api/chatbot/send').set(auth(patient.token)).send({ message: 'second' });

    const history = await request(app).get('/api/chatbot/history').set(auth(patient.token));
    assert.deepEqual(history.body.chats.map((c) => c.message), ['first', 'second']);
  });

  it('reports health and handles bad input gracefully', async () => {
    const health = await request(app).get('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.database, 'connected');

    assert.equal((await request(app).get('/api/nope')).status, 404);

    const badJson = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
    assert.equal(badJson.status, 400);
  });
});
