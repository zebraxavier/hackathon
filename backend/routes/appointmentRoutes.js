const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateObjectId } = require('../middleware/validateObjectId');
const { earliestBookableDate } = require('../utils/dates');

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$|^(0?[1-9]|1[0-2]):[0-5]\d\s?(AM|PM)$/i;
const UPDATABLE_STATUSES = ['scheduled', 'completed', 'cancelled', 'no-show'];


// POST /api/appointments/book - Book appointment (Patient only)
router.post('/book', protect, authorize('patient'), asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

  if (!doctorId || !appointmentDate || !appointmentTime || !reason || !String(reason).trim()) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  if (!mongoose.isValidObjectId(doctorId)) {
    return res.status(400).json({ success: false, message: 'Invalid doctor ID' });
  }

  const date = new Date(appointmentDate);
  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid appointment date' });
  }

  if (date < earliestBookableDate()) {
    return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past' });
  }

  if (!TIME_REGEX.test(String(appointmentTime).trim())) {
    return res.status(400).json({ success: false, message: 'Invalid appointment time' });
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  const slotTaken = await Appointment.exists({
    doctorId,
    appointmentDate: date,
    appointmentTime: String(appointmentTime).trim(),
    status: 'scheduled'
  });
  if (slotTaken) {
    return res.status(409).json({ success: false, message: 'This time slot is already booked' });
  }

  const appointment = await Appointment.create({
    patientId: req.user._id,
    doctorId,
    appointmentDate: date,
    appointmentTime: String(appointmentTime).trim(),
    reason: String(reason).trim(),
    status: 'scheduled'
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email');

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    appointment: populatedAppointment
  });
}));

// GET /api/appointments - Get appointments (role-based)
router.get('/', protect, asyncHandler(async (req, res) => {
  const query = {};

  if (req.user.role === 'patient') {
    query.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctorId = req.user._id;
  }
  // Nurses coordinate the whole clinic and see all appointments.

  const appointments = await Appointment.find(query)
    .populate('patientId', 'name email phone')
    .populate('doctorId', 'name email')
    .sort({ appointmentDate: -1 })
    .limit(200);

  res.status(200).json({ success: true, count: appointments.length, appointments });
}));

// PUT /api/appointments/:id - Update appointment status
router.put('/:id', protect, authorize('doctor', 'nurse'), validateObjectId(), asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (status === undefined && notes === undefined) {
    return res.status(400).json({ success: false, message: 'Nothing to update' });
  }

  if (status !== undefined && !UPDATABLE_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment status' });
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  // Doctors may only manage their own appointments.
  if (req.user.role === 'doctor' && String(appointment.doctorId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
  }

  if (status !== undefined) appointment.status = status;
  if (notes !== undefined) appointment.notes = notes;
  await appointment.save();

  await appointment.populate([
    { path: 'patientId', select: 'name email phone' },
    { path: 'doctorId', select: 'name email' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    appointment
  });
}));

module.exports = router;
