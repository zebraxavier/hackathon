const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { getAllowedOrigins } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { rejectMongoOperators } = require('./middleware/sanitizeMiddleware');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const nurseRoutes = require('./routes/nurseRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const profileRoutes = require('./routes/profileRoutes');
const reportRoutes = require('./routes/reportRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

// Needed for correct client IPs (rate limiting) behind Render/Railway/Nginx etc.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());

const allowedOrigins = getAllowedOrigins();
app.use(cors({
  origin: (origin, callback) => {
    // Non-browser clients (curl, health checks) send no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', apiLimiter);
app.use('/api', rejectMongoOperators);

app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'AI-Powered Clinical Web Platform API' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
