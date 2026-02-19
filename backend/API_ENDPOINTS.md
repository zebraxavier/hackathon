# Complete API Endpoints Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication Required
Most endpoints require JWT token in header:
```
Authorization: Bearer <your_token>
```

---

## 🔐 Authentication Routes (`/api/auth`)

### 1. Register Patient
**POST** `/api/auth/register`

**Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for OTP verification.",
  "userId": "user_id"
}
```

---

### 2. Verify OTP
**POST** `/api/auth/verify-otp`

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

---

### 3. Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

---

### 4. Logout
**POST** `/api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 Profile Routes (`/api/profile`)

### 5. Get Profile
**GET** `/api/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "patient",
    "address": "123 Main St",
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  },
  "patientDetails": { }
}
```

---

### 6. Update Profile
**PUT** `/api/profile/update`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "address": "456 New St",
  "dateOfBirth": "1990-01-01",
  "gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { }
}
```

---

## 🤖 Chatbot Routes (`/api/chatbot`)

### 7. Send Message
**POST** `/api/chatbot/send`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "message": "I need to book an appointment"
}
```

**Response:**
```json
{
  "success": true,
  "message": "I need to book an appointment",
  "reply": "You can book an appointment through the Appointments section...",
  "timestamp": "2026-02-20T01:00:00.000Z"
}
```

---

### 8. Get Chat History
**GET** `/api/chatbot/history`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "chats": [
    {
      "_id": "chat_id",
      "userId": "user_id",
      "message": "Hello",
      "reply": "Hello! How can I help you?",
      "timestamp": "2026-02-20T01:00:00.000Z"
    }
  ]
}
```

---

## 📅 Appointment Routes (`/api/appointments`)

### 9. Book Appointment (Patient Only)
**POST** `/api/appointments/book`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "doctorId": "doctor_id_here",
  "appointmentDate": "2026-03-01",
  "appointmentTime": "10:00 AM",
  "reason": "Regular checkup"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "appointment_id",
    "patientId": { },
    "doctorId": { },
    "appointmentDate": "2026-03-01",
    "appointmentTime": "10:00 AM",
    "reason": "Regular checkup",
    "status": "scheduled"
  }
}
```

---

### 10. Get Appointments (Role-based)
**GET** `/api/appointments`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "appointments": [ ]
}
```

---

### 11. Update Appointment (Doctor/Nurse Only)
**PUT** `/api/appointments/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "completed",
  "notes": "Patient is healthy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "appointment": { }
}
```

---

## 🏥 Patient Routes (`/api/patient`)

### 12. Get Patient Dashboard
**GET** `/api/patient/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "patientDetails": { },
  "upcomingAppointments": [ ],
  "recentReports": [ ]
}
```

---

### 13. Get Patient Reports
**GET** `/api/patient/reports`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 3,
  "reports": [ ]
}
```

---

### 14. Get Medical History
**GET** `/api/patient/medical-history`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "medicalHistory": [ ],
  "allergies": [ ],
  "medications": [ ],
  "vitals": { }
}
```

---

### 15. Get Doctors List
**GET** `/api/patient/doctors`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "phone": "1234567890"
    }
  ]
}
```

---

## 👨‍⚕️ Doctor Routes (`/api/doctor`)

### 16. Get All Patients
**GET** `/api/doctor/patients`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 20,
  "patients": [ ]
}
```

---

### 17. Get Patient Details
**GET** `/api/doctor/patient/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "patient": { },
  "patientDetails": { },
  "reports": [ ],
  "appointments": [ ]
}
```

---

### 18. Get Doctor Dashboard
**GET** `/api/doctor/dashboard`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalPatients": 50,
    "todayAppointments": 5
  },
  "recentAppointments": [ ]
}
```

---

## 👩‍⚕️ Nurse Routes (`/api/nurse`)

### 19. Upload Report
**POST** `/api/nurse/upload-report`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File (PDF, DOC, DOCX, JPG, PNG)
- `patientId`: String
- `reportType`: String (lab, radiology, prescription, discharge, other)
- `title`: String
- `description`: String (optional)
- `testDate`: Date (optional)

**Response:**
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "report": {
    "_id": "report_id",
    "patientId": { },
    "uploadedBy": { },
    "reportType": "lab",
    "title": "Blood Test Results",
    "fileName": "report.pdf",
    "filePath": "uploads/report-123456.pdf"
  }
}
```

---

### 20. Update Patient Vitals
**PUT** `/api/nurse/patient/:id/vitals`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "bloodPressure": "120/80",
  "heartRate": 72,
  "temperature": 98.6,
  "weight": 70,
  "height": 175
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vitals updated successfully",
  "vitals": {
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 98.6,
    "weight": 70,
    "height": 175,
    "lastUpdated": "2026-02-20T01:00:00.000Z"
  }
}
```

---

### 21. Get All Patients (Nurse)
**GET** `/api/nurse/patients`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "count": 20,
  "patients": [ ]
}
```

---

## 📄 Report Routes (`/api/reports`)

### 22. Get Specific Report
**GET** `/api/reports/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "report": {
    "_id": "report_id",
    "patientId": { },
    "uploadedBy": { },
    "reportType": "lab",
    "title": "Blood Test Results",
    "description": "Complete blood count",
    "fileName": "report.pdf",
    "filePath": "uploads/report-123456.pdf",
    "fileSize": 102400,
    "mimeType": "application/pdf",
    "testDate": "2026-02-20",
    "createdAt": "2026-02-20T01:00:00.000Z"
  }
}
```

---

## 🏥 Health Check

### 23. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-20T01:00:00.000Z"
}
```

---

## ❌ Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📝 Notes

1. All dates should be in ISO 8601 format
2. File uploads limited to 10MB
3. JWT tokens expire in 24 hours
4. OTP expires in 10 minutes
5. Rate limit: 100 requests per 15 minutes per IP
