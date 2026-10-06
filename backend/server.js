require('dotenv').config();

const mongoose = require('mongoose');
const { validateEnv } = require('./config/env');

try {
  validateEnv();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    // Force exit if connections do not drain in time.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

start();
