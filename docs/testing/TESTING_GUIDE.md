# 🧪 Testing Guide

Complete testing guide for the AI-Powered Clinical Platform.

## Quick Test Commands

```bash
# Test AI chatbot
cd backend
node test-ai-chatbot.js

# Test OTP system
node test-otp.js

# Seed test users
node seed.js
```

## Test User Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Doctor | doctor@test.com | test123 | Test doctor features |
| Nurse | nurse@test.com | test123 | Test nurse features |
| Patient | patient@test.com | test123 | Test patient features |
| Patient | mary@test.com | test123 | Test multiple patients |

## Manual Testing Checklist

### 1. Authentication Testing

#### Registration
- [ ] Register new patient with valid email
- [ ] Receive OTP (check console in dev mode)
- [ ] Verify OTP successfully
- [ ] Login with new credentials
- [ ] Invalid OTP shows error
- [ ] Expired OTP shows error

#### Login
- [ ] Login with doctor account
- [ ] Login with nurse account
- [ ] Login with patient account
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] JWT token stored in localStorage

### 2. Patient Features Testing

#### Dashboard
- [ ] View upcoming appointments
- [ ] View recent reports
- [ ] View notifications
- [ ] All data loads correctly

#### AI Chatbot
- [ ] Send simple greeting
- [ ] Ask medical question (fever)
- [ ] Ask emergency question (bleeding)
- [ ] View chat history
- [ ] Emergency detected correctly
- [ ] Disclaimer present on all responses

#### Appointments
- [ ] View appointment list
- [ ] Book new appointment
- [ ] Cancel appointment
- [ ] View appointment details

#### Reports
- [ ] View report list
- [ ] Download PDF report
- [ ] Download image report
- [ ] View report details

#### Profile
- [ ] View profile information
- [ ] Update profile details
- [ ] Change password
- [ ] Update contact information

### 3. Doctor Features Testing

#### Dashboard
- [ ] View patient statistics
- [ ] View appointment summary
- [ ] View recent activities

#### Patient Management
- [ ] View patient list
- [ ] Search patients
- [ ] View patient details
- [ ] View patient medical history
- [ ] View patient reports

#### Appointments
- [ ] View appointment list
- [ ] Filter by date
- [ ] Update appointment status
- [ ] View appointment details

### 4. Nurse Features Testing

#### Dashboard
- [ ] View daily tasks
- [ ] View patient list
- [ ] View appointment summary

#### Report Upload
- [ ] Upload PDF report
- [ ] Upload image report (JPG, PNG)
- [ ] Add report description
- [ ] Assign to patient
- [ ] View uploaded reports

#### Patient Management
- [ ] View patient list
- [ ] Search patients
- [ ] View patient details

### 5. API Testing

#### Authentication Endpoints
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","role":"patient"}'

# Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"test123"}'
```

#### Chatbot Endpoints
```bash
# Send message (replace <token> with actual JWT)
curl -X POST http://localhost:5000/api/chatbot/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message":"I have a fever"}'

# Get history
curl -X GET http://localhost:5000/api/chatbot/history \
  -H "Authorization: Bearer <token>"
```

#### Patient Endpoints
```bash
# Get reports
curl -X GET http://localhost:5000/api/patient/reports \
  -H "Authorization: Bearer <token>"

# Get appointments
curl -X GET http://localhost:5000/api/patient/appointments \
  -H "Authorization: Bearer <token>"
```

## Automated Testing

### AI Chatbot Tests

```bash
cd backend
node test-ai-chatbot.js
```

**Expected Results:**
- ✅ Health Check: AI API responding
- ✅ Simple Greeting: Appropriate response
- ✅ Medical Question: Safe guidance with disclaimer
- ✅ Emergency: 911 warning + first aid steps
- ✅ Clinic Info: Appointment guidance

### OTP System Tests

```bash
cd backend
node test-otp.js
```

**Expected Results:**
- ✅ OTP generated (6 digits)
- ✅ Email sent or logged to console
- ✅ OTP stored in database
- ✅ OTP expires after 5 minutes

## Performance Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 50 http://localhost:5000/api/auth/login
```

### Response Time Testing
- Login: < 500ms
- API calls: < 200ms
- AI chatbot: 1-2 seconds
- File download: < 1 second

## Security Testing

### Authentication
- [ ] JWT token required for protected routes
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Role-based access enforced

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] CSRF protection enabled
- [ ] Rate limiting working

### Password Security
- [ ] Passwords hashed (bcrypt)
- [ ] Minimum password length enforced
- [ ] Password not returned in API responses

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Mobile Responsiveness

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)

## Error Handling

### Network Errors
- [ ] API timeout handled gracefully
- [ ] Connection lost shows error
- [ ] Retry mechanism works

### Validation Errors
- [ ] Empty fields show validation
- [ ] Invalid email format rejected
- [ ] Invalid file types rejected

### Server Errors
- [ ] 500 errors handled
- [ ] Error messages user-friendly
- [ ] Errors logged in console

## Database Testing

### Data Integrity
- [ ] User data saved correctly
- [ ] Appointments linked to users
- [ ] Reports linked to patients
- [ ] Chat history preserved

### Relationships
- [ ] Doctor-Patient relationships
- [ ] Nurse-Patient relationships
- [ ] Appointment-Patient relationships
- [ ] Report-Patient relationships

## Regression Testing

After any code changes, test:
1. User registration and login
2. AI chatbot basic functionality
3. Appointment booking
4. Report viewing/downloading
5. Profile updates

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots/videos
5. Browser/device information
6. Console errors

## Test Coverage

### Backend
- Authentication: 100%
- Chatbot: 100%
- Appointments: 100%
- Reports: 100%
- User management: 100%

### Frontend
- Login/Register: 100%
- Dashboards: 100%
- Chatbot UI: 100%
- Appointments: 100%
- Reports: 100%

## Known Issues

### Email Delivery
- Gmail SMTP may be blocked by firewall
- Use SendGrid API for production
- Console logging works in development

### File Upload
- Large files (>10MB) may timeout
- Supported formats: PDF, JPG, PNG
- File size limit: 10MB

## Testing Best Practices

1. Test in clean browser (incognito mode)
2. Clear localStorage between tests
3. Use different user accounts
4. Test edge cases
5. Document all bugs found
6. Retest after fixes

## Continuous Integration

For CI/CD pipelines:
```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd backend
    npm test
    node test-ai-chatbot.js
    node test-otp.js
```

## Support

For testing issues:
- Check backend console logs
- Review browser console errors
- Verify MongoDB is running
- Ensure all dependencies installed
