const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI-Powered Clinical Web Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      patient: '/api/patient',
      doctor: '/api/doctor',
      nurse: '/api/nurse',
      chatbot: '/api/chatbot',
      profile: '/api/profile',
      reports: '/api/reports',
      appointments: '/api/appointments'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 AI-Powered Clinical Web Platform Backend            ║
║                                                           ║
║   ✅ Server running on port ${PORT}                         ║
║   ✅ Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   ✅ API Base URL: http://localhost:${PORT}/api              ║
║                                                           ║
║   📚 Available Endpoints:                                 ║
║      - POST /api/auth/register                            ║
║      - POST /api/auth/verify-otp                          ║
║      - POST /api/auth/login                               ║
║      - POST /api/auth/logout                              ║
║      - GET  /api/profile                                  ║
║      - PUT  /api/profile/update                           ║
║      - POST /api/chatbot/send                             ║
║      - GET  /api/chatbot/history                          ║
║      - POST /api/appointments/book                        ║
║      - GET  /api/appointments                             ║
║      - POST /api/nurse/upload-report                      ║
║      - GET  /api/patient/dashboard                        ║
║      - GET  /api/doctor/patients                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

module.exports = app;
