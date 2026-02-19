# OTP System - Quick Reference Guide

## 🚀 Quick Start (Development)

### Current Setup - Works Out of the Box!
No email configuration needed for testing.

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Register New User:**
   - Use any email address (e.g., `test@example.com`)
   - Check backend console for OTP

3. **Find Your OTP:**
   Look for this in backend console:
   ```
   🔐 DEVELOPMENT OTP for test@example.com: 558089
   ```

4. **Verify:**
   - Use the OTP from console, OR
   - Use test OTP: `123456` (always works in development)

---

## 📧 Production Setup (Real Emails)

### Gmail Configuration (5 minutes)

1. **Get App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2-Step Verification first
   - Create App Password for "Mail"
   - Copy the 16-character password

2. **Update `.env` file:**
   ```env
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   ```
   (Remove spaces from App Password)

3. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

4. **Test:**
   - Register with your real email
   - Check inbox (and spam folder)

---

## 🧪 Testing

### Automated Test
```bash
cd backend
node test-otp.js
```

### Manual Test
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Register new user
4. Check console for OTP
5. Verify with OTP

---

## 🔍 Troubleshooting

### "Email not received"
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- Check backend console for errors
- Ensure App Password (not regular password) for Gmail

### "Invalid login" error
- Use Gmail App Password, not regular password
- Remove spaces from App Password
- Verify 2-Step Verification is enabled

### "Connection timeout"
- Check firewall/antivirus settings
- Verify internet connection
- Try port 465 instead of 587

---

## 📊 Rate Limits

- **Registration**: 5 per 15 minutes per IP
- **Verification**: 10 per 15 minutes per IP
- **Login**: 10 per 15 minutes per IP

If you hit the limit, wait 15 minutes or use a different IP.

---

## 🔐 Test Credentials

### Pre-seeded Users
```
Doctor:
  Email: doctor@test.com
  Password: test123

Nurse:
  Email: nurse@test.com
  Password: test123

Patient:
  Email: patient@test.com
  Password: test123
```

### Test OTP (Development Only)
```
OTP: 123456
```
Works for any email in development mode.

---

## 📚 Documentation

- **Complete Guide**: `backend/EMAIL_CONFIGURATION_GUIDE.md`
- **Fix Details**: `OTP_EMAIL_FIX_COMPLETE.md`
- **Project Status**: `PROJECT_STATUS_UPDATE.md`
- **API Docs**: `backend/API_ENDPOINTS.md`

---

## ✅ Current Status

- ✅ Development mode: Working (console OTP)
- ✅ Test OTP: Working (`123456`)
- ✅ Rate limiting: Active
- ✅ Error handling: Comprehensive
- ⚠️ Production emails: Requires Gmail App Password

---

## 🆘 Need Help?

1. Check backend console for detailed error messages
2. Read `backend/EMAIL_CONFIGURATION_GUIDE.md`
3. Run test script: `node backend/test-otp.js`
4. Verify `.env` configuration

---

## 🎯 Summary

**Development**: Works immediately, no setup needed  
**Production**: 5-minute Gmail setup for real emails  
**Testing**: Automated test script included  
**Security**: Rate limiting and validation active  
**Support**: Comprehensive documentation provided
