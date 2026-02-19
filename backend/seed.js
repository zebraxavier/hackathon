const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Chat = require('./models/Chat');

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Chat.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create Doctor (password will be hashed by User model)
    const doctor = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor@test.com',
      password: 'test123',
      phone: '555-0101',
      role: 'doctor',
      isVerified: true,
      address: '123 Medical Center Dr',
      gender: 'female'
    });
    console.log('✅ Doctor created:', doctor.email);

    // Create Nurse
    const nurse = await User.create({
      name: 'Nurse Emily Davis',
      email: 'nurse@test.com',
      password: 'test123',
      phone: '555-0102',
      role: 'nurse',
      isVerified: true,
      address: '456 Hospital Ave',
      gender: 'female'
    });
    console.log('✅ Nurse created:', nurse.email);

    // Create Patient 1
    const patient1 = await User.create({
      name: 'John Smith',
      email: 'patient@test.com',
      password: 'test123',
      phone: '555-0103',
      role: 'patient',
      isVerified: true,
      address: '789 Patient St',
      gender: 'male',
      dateOfBirth: new Date('1990-01-15')
    });
    console.log('✅ Patient 1 created:', patient1.email);

    // Create Patient 2
    const patient2 = await User.create({
      name: 'Mary Johnson',
      email: 'mary@test.com',
      password: 'test123',
      phone: '555-0106',
      role: 'patient',
      isVerified: true,
      address: '321 Oak Street',
      gender: 'female',
      dateOfBirth: new Date('1985-07-22')
    });
    console.log('✅ Patient 2 created:', patient2.email);

    // Create Patient Details for Patient 1
    await Patient.create({
      userId: patient1._id,
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2020-05-10'),
          notes: 'Controlled with medication'
        },
        {
          condition: 'Type 2 Diabetes',
          diagnosedDate: new Date('2021-03-15'),
          notes: 'Diet controlled'
        }
      ],
      allergies: ['Penicillin', 'Peanuts'],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          startDate: new Date('2020-05-10')
        },
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          startDate: new Date('2021-03-15')
        }
      ],
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6,
        weight: 75,
        height: 175,
        lastUpdated: new Date()
      },
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'Spouse',
        phone: '555-0104'
      },
      insuranceInfo: {
        provider: 'HealthCare Plus',
        policyNumber: 'HCP123456789'
      }
    });
    console.log('✅ Patient 1 details created');

    // Create Patient Details for Patient 2
    await Patient.create({
      userId: patient2._id,
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: new Date('2015-08-20'),
          notes: 'Mild, controlled with inhaler'
        }
      ],
      allergies: ['Latex', 'Shellfish'],
      medications: [
        {
          name: 'Albuterol Inhaler',
          dosage: '90mcg',
          frequency: 'As needed',
          startDate: new Date('2015-08-20')
        }
      ],
      vitals: {
        bloodPressure: '118/75',
        heartRate: 68,
        temperature: 98.4,
        weight: 65,
        height: 165,
        lastUpdated: new Date()
      },
      emergencyContact: {
        name: 'Robert Johnson',
        relationship: 'Husband',
        phone: '555-0107'
      }
    });
    console.log('✅ Patient 2 details created');

    // Create Appointments
    await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor._id,
      appointmentDate: new Date('2026-02-25'),
      appointmentTime: '10:00 AM',
      reason: 'Regular checkup',
      status: 'scheduled'
    });

    await Appointment.create({
      patientId: patient1._id,
      doctorId: doctor._id,
      appointmentDate: new Date('2026-02-20'),
      appointmentTime: '2:00 PM',
      reason: 'Follow-up consultation',
      status: 'completed',
      notes: 'Patient is doing well. Continue current medication.'
    });

    await Appointment.create({
      patientId: patient2._id,
      doctorId: doctor._id,
      appointmentDate: new Date('2026-02-28'),
      appointmentTime: '11:30 AM',
      reason: 'Asthma review',
      status: 'scheduled'
    });

    console.log('✅ Appointments created');

    // Create Chat Messages
    await Chat.create({
      userId: patient1._id,
      message: 'Hello, I need help booking an appointment',
      reply: 'Hello! I can help you with that. You can book an appointment through the Appointments section. Would you like me to guide you there?',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    });

    await Chat.create({
      userId: patient1._id,
      message: 'What are my upcoming appointments?',
      reply: 'You have an appointment scheduled with Dr. Sarah Johnson on February 25, 2026 at 10:00 AM for a regular checkup.',
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    });

    await Chat.create({
      userId: patient1._id,
      message: 'Can I see my medical reports?',
      reply: 'Your medical reports are available in the Reports section. You can view and download them anytime. Would you like me to show you how?',
      timestamp: new Date()
    });

    console.log('✅ Chat messages created');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍⚕️  Doctor:   doctor@test.com   / test123');
    console.log('👩‍⚕️  Nurse:    nurse@test.com    / test123');
    console.log('🧑  Patient 1: patient@test.com  / test123');
    console.log('👩  Patient 2: mary@test.com     / test123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Created Data:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 4 Users (1 Doctor, 1 Nurse, 2 Patients)');
    console.log('✅ 2 Patient profiles with medical history');
    console.log('✅ 3 Appointments (2 for Patient 1, 1 for Patient 2)');
    console.log('✅ 3 Chat messages');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('🔗 API will be available at: http://localhost:5000/api\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seed function
seed();
