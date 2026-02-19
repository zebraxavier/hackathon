# 🚀 Quick Start Guide

Get your AI-Powered Clinical Platform up and running in 5 minutes.

## Prerequisites

- Node.js v16+ installed
- MongoDB running on localhost:27017
- Git installed

## Step 1: Installation (2 minutes)

```bash
# Clone repository
git clone <repository-url>
cd AI-Powered-Clinical-Web-Platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Configuration (1 minute)

The `backend/.env` file is already configured with default settings. For production, update:

```env
# Update these for production
JWT_SECRET=your_secure_secret_key
AI_API_KEY=your_groq_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

## Step 3: Database Setup (1 minute)

```bash
# Make sure MongoDB is running
# Then seed test users
cd backend
node seed.js
```

## Step 4: Start Application (1 minute)

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend (from root)
npm run dev
```

## Step 5: Login & Test

1. Open http://localhost:5173
2. Login with test account:
   - Email: `patient@test.com`
   - Password: `test123`
3. Try the AI chatbot: "I have a fever"

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Doctor | doctor@test.com | test123 |
| Nurse | nurse@test.com | test123 |
| Patient | patient@test.com | test123 |

## Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod
```

### Port Already in Use
```bash
# Backend (port 5000)
# Kill process using port 5000

# Frontend (port 5173)
# Kill process using port 5173
```

### AI Chatbot Not Working
1. Check `backend/.env` has `AI_API_KEY`
2. Get free API key from https://console.groq.com/keys
3. Restart backend server

## Next Steps

- Read [API Documentation](../../backend/API_ENDPOINTS.md)
- Review [Testing Guide](../testing/TESTING_GUIDE.md)
- Check [Production Deployment](PRODUCTION_DEPLOYMENT.md)
