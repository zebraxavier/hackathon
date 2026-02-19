# AI-Powered Clinical Web Platform - Backend

Complete production-ready backend for the Clinical Web Platform with role-based access control for Doctors, Nurses, and Patients.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env` file and update with your credentials
- Update MongoDB URI
- Configure email settings for OTP

4. Start MongoDB (if using local):
```bash
mongod
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file with the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/clinical_platform
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:5173
```

### Email Configuration (Gmail)
1. Enable 2-Factor Authentication in your Google Account
2. Generate App Password: Google Account → Security → App Passwords
3. Use the generated password in `EMAIL_PASSWORD`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register Patient
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St"
}
```

#### Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Profile Endpoints

#### Get Profile
```http
GET /api/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/profile/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "address": "456 New St"
}
```

### Chatbot Endpoints

#### Send Message
```http
POST /api/chatbot/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I need to book an appointment"
}
```

#### Get Chat History
```http
GET /api/chatbot/history
Authorization: Bearer <token>
```

### Appointment Endpoints

#### Book Appointment (Patient)
```http
POST /api/appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctorId": "doctor_id_here",
  "appointmentDate": "2026-03-01",
  "appointmentTime": "10:00 AM",
  "reason": "Regular checkup"
}
```

#### Get Appointments
```http
GET /api/appointments
Authorization: Bearer <token>
```

#### Update Appointment (Doctor/Nurse)
```http
PUT /api/appointments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "notes": "Patient is healthy"
}
```

### Patient Endpoints

#### Get Dashboard
```http
GET /api/patient/dashboard
Authorization: Bearer <token>
```

#### Get Reports
```http
GET /api/patient/reports
Authorization: Bearer <token>
```

#### Get Medical History
```http
GET /api/patient/medical-history
Authorization: Bearer <token>
```

#### Get Doctors List
```http
GET /api/patient/doctors
Authorization: Bearer <token>
```

### Doctor Endpoints

#### Get All Patients
```http
GET /api/doctor/patients
Authorization: Bearer <token>
```

#### Get Patient Details
```http
GET /api/doctor/patient/:id
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /api/doctor/dashboard
Authorization: Bearer <token>
```

### Nurse Endpoints

#### Upload Report
```http
POST /api/nurse/upload-report
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file>,
  "patientId": "patient_id_here",
  "reportType": "lab",
  "title": "Blood Test Results",
  "description": "Complete blood count",
  "testDate": "2026-02-20"
}
```

#### Update Patient Vitals
```http
PUT /api/nurse/patient/:id/vitals
Authorization: Bearer <token>
Content-Type: application/json

{
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 98.6,
  "weight": 70,
  "height": 175
}
```

#### Get All Patients
```http
GET /api/nurse/patients
Authorization: Bearer <token>
```

### Report Endpoints

#### Get Specific Report
```http
GET /api/reports/:id
Authorization: Bearer <token>
```

## 🔐 Authentication

All protected routes require JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Token is returned after successful login or OTP verification.

## 👥 User Roles

- **Patient**: Can view own data, book appointments, use chatbot
- **Doctor**: Can view all patients, manage appointments, view reports
- **Nurse**: Can upload reports, update vitals, view patients

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT authentication with 24h expiration
- Role-based access control (RBAC)
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS protection
- Input validation
- File upload restrictions (10MB, specific types only)

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── roleMiddleware.js     # Role-based access
│   └── errorMiddleware.js    # Error handling
├── models/
│   ├── User.js               # User schema
│   ├── Patient.js            # Patient details
│   ├── Appointment.js        # Appointments
│   ├── Report.js             # Medical reports
│   └── Chat.js               # Chatbot messages
├── routes/
│   ├── authRoutes.js         # Authentication
│   ├── patientRoutes.js      # Patient endpoints
│   ├── doctorRoutes.js       # Doctor endpoints
│   ├── nurseRoutes.js        # Nurse endpoints
│   ├── chatbotRoutes.js      # Chatbot
│   ├── profileRoutes.js      # Profile management
│   ├── reportRoutes.js       # Reports
│   └── appointmentRoutes.js  # Appointments
├── utils/
│   ├── sendOTP.js            # OTP email service
│   └── token.js              # JWT utilities
├── uploads/                  # Uploaded files
├── .env                      # Environment variables
├── package.json              # Dependencies
└── server.js                 # Main server file
```

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","role":"patient"}'
```

### Using Postman

1. Import the API endpoints
2. Set Authorization to Bearer Token
3. Add token from login response

## 🔧 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD
- Enable "Less secure app access" or use App Password
- Verify SMTP settings

### CORS Error
- Add your frontend URL to FRONTEND_URL in .env
- Check corsOptions in server.js

## 📝 Notes

- Default port: 5000
- JWT expires in 24 hours
- OTP expires in 10 minutes
- File upload limit: 10MB
- Supported file types: PDF, DOC, DOCX, JPG, PNG

## 🚀 Production Deployment

1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Use MongoDB Atlas or production database
4. Configure production email service
5. Enable HTTPS
6. Set up proper logging
7. Configure backup strategy

## 📞 Support

For issues or questions, please check the documentation or contact the development team.
