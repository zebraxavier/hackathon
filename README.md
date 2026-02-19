# 🏥 AI-Powered Clinical Web Platform

A comprehensive healthcare management system with AI-powered chatbot for medical first aid guidance, appointment scheduling, and patient management.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered-Clinical-Web-Platform
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example .env file
   cd backend
   # Edit .env with your configuration
   ```

4. **Seed test users**
   ```bash
   cd backend
   node seed.js
   ```

5. **Start the application**
   ```bash
   # Terminal 1: Start backend (from backend folder)
   npm start

   # Terminal 2: Start frontend (from root folder)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 👥 Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| Doctor | doctor@test.com | test123 |
| Nurse | nurse@test.com | test123 |
| Patient | patient@test.com | test123 |
| Patient | mary@test.com | test123 |

## ✨ Features

### 🤖 AI-Powered Chatbot
- Medical first aid guidance
- Emergency detection
- Safe, non-diagnostic responses
- Powered by Groq AI (llama-3.3-70b-versatile)

### 👨‍⚕️ Doctor Features
- Patient management
- View medical reports
- Appointment scheduling
- Dashboard analytics

### 👩‍⚕️ Nurse Features
- Upload medical reports (PDF/Images)
- Patient list management
- Appointment management

### 🧑‍🦱 Patient Features
- AI chatbot for health guidance
- Book appointments
- View and download medical reports
- Profile management
- Notifications

## 🔐 Security Features

- JWT authentication (24h expiry)
- OTP email verification
- Password hashing (bcrypt)
- Role-based access control
- Rate limiting
- Input sanitization
- CORS protection

## 📚 Documentation

### Setup Guides
- [Quick Start Guide](docs/setup/QUICK_START.md)
- [Production Deployment](docs/setup/PRODUCTION_DEPLOYMENT.md)
- [Email Configuration](docs/setup/EMAIL_SETUP.md)

### Feature Documentation
- [AI Chatbot Integration](docs/features/AI_CHATBOT.md)
- [API Endpoints](backend/API_ENDPOINTS.md)
- [Authentication System](docs/features/AUTHENTICATION.md)

### Testing
- [Testing Guide](docs/testing/TESTING_GUIDE.md)
- [QA Report Summary](docs/testing/QA_SUMMARY.md)

## 🛠️ Technology Stack

### Frontend
- React 18
- TypeScript
- Vite
- Bootstrap
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Nodemailer
- Groq AI API

## 📊 Project Status

✅ Backend API - Fully operational  
✅ Frontend UI - Complete  
✅ AI Chatbot - Operational (Groq AI)  
✅ Authentication - Working (JWT + OTP)  
✅ Database - Connected (MongoDB)  
⚠️ Email System - Console logging (requires SendGrid for production)

## 🔧 Configuration

### Environment Variables

Create a `backend/.env` file with:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/clinical_platform

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h

# Email (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="Clinical Platform <your_email@gmail.com>"

# AI API (Groq)
AI_API_KEY=your_groq_api_key
AI_API_URL=https://api.groq.com/openai/v1/chat/completions
AI_MODEL=llama-3.3-70b-versatile

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

```bash
# Test AI chatbot
cd backend
node test-ai-chatbot.js

# Test OTP system
node test-otp.js

# Seed test users
node seed.js
```

## 📝 API Documentation

See [API_ENDPOINTS.md](backend/API_ENDPOINTS.md) for complete API documentation.

### Key Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - User login
- `POST /api/chatbot/send` - Send message to AI chatbot
- `GET /api/chatbot/history` - Get chat history
- `GET /api/patient/reports` - Get patient reports
- `POST /api/appointments` - Create appointment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the [documentation](docs/)
- Review [testing guide](docs/testing/TESTING_GUIDE.md)
- See [current status](CURRENT_STATUS.md)

## 🎯 Roadmap

- [ ] Video consultations
- [ ] Payment integration
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced analytics

---

**Version:** 2.0  
**Last Updated:** February 20, 2026  
**Status:** Production Ready
