# Testing Guide - Quick Setup

## 🚨 Current Issues & Solutions

### Issue 1: Test Credentials Not Working

The test credentials from the seed script should work, but let me verify:

**Test these credentials:**
- Email: `doctor@test.com` / Password: `test123` / Role: `doctor`
- Email: `nurse@test.com` / Password: `test123` / Role: `nurse`  
- Email: `patient@test.com` / Password: `test123` / Role: `patient`

**If they don't work, run the seed script again:**
```cmd
cd backend
node seed.js
```

### Issue 2: OTP Email Not Received

The OTP email feature requires Gmail configuration. Here are your options:

---

## ✅ Solution 1: Configure Gmail (Recommended for Production)

### Step 1: Enable Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click "Security" in the left menu
3. Enable "2-Step Verification" (if not already enabled)
4. Go back to Security
5. Click "App passwords"
6. Select "Mail" and "Windows Computer"
7. Click "Generate"
8. Copy the 16-character password

### Step 2: Update Backend .env

Edit `backend/.env`:

```env
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

### Step 3: Restart Backend

```cmd
cd backend
# Stop the current server (Ctrl+C)
npm start
```

---

## ✅ Solution 2: Skip OTP for Testing (Quick Fix)

For testing purposes, you can bypass OTP verification:

### Option A: Get OTP from MongoDB

1. Register a new user
2. Open MongoDB Compass
3. Connect to `mongodb://localhost:27017`
4. Go to `clinical_platform` database
5. Open `users` collection
6. Find your user by email
7. Copy the `otp` field value
8. Use that OTP in the verification screen

### Option B: Use Pre-verified Test Accounts

The seed script creates pre-verified accounts. Make sure you ran:

```cmd
cd backend
node seed.js
```

This creates:
- `doctor@test.com` / `test123` (already verified)
- `nurse@test.com` / `test123` (already verified)
- `patient@test.com` / `test123` (already verified)

---

## 🧪 Testing Without Email Configuration

### Method 1: Direct Login (No Registration)

Use the pre-created test accounts:

1. Go to http://localhost:5173
2. Click "Sign In"
3. Enter:
   - Email: `doctor@test.com`
   - Password: `test123`
   - Role: `Doctor`
4. Click "Sign In"

### Method 2: Check OTP in Database

If you register a new user:

1. Register with your email
2. Open MongoDB Compass
3. Find the OTP in the database
4. Enter it in the verification screen

### Method 3: Modify Backend to Show OTP in Console

Edit `backend/routes/authRoutes.js` temporarily:

```javascript
// After generating OTP, add this line:
console.log(`🔐 OTP for ${email}: ${otp}`);
```

Then check the backend terminal for the OTP.

---

## 🔧 Quick Fix: Temporary OTP Bypass

For development/testing only, you can modify the OTP verification:

### Edit `backend/routes/authRoutes.js`

Find the verify-otp route and add a test OTP:

```javascript
// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // TEMPORARY: Accept test OTP for development
    if (otp === '123456') {
      const user = await User.findOne({ email });
      if (user) {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        
        const token = generateToken(user._id, user.role);
        return res.status(200).json({
          success: true,
          message: 'Email verified successfully',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });
      }
    }

    // ... rest of the code
  }
});
```

Now you can use `123456` as OTP for any registration during testing.

---

## 📊 Verify Database Has Test Users

### Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `clinical_platform`
4. Open collection: `users`
5. You should see 4 users:
   - doctor@test.com
   - nurse@test.com
   - patient@test.com
   - mary@test.com

### Using Command Line

```cmd
cd backend
node -e "const mongoose = require('mongoose'); const User = require('./models/User'); mongoose.connect('mongodb://localhost:27017/clinical_platform').then(async () => { const users = await User.find({}); console.log('Users:', users.map(u => ({ email: u.email, role: u.role, verified: u.isVerified }))); process.exit(); });"
```

---

## 🎯 Recommended Testing Flow

### For Immediate Testing (No Email Setup)

1. **Use Pre-created Accounts**
   ```
   Email: doctor@test.com
   Password: test123
   Role: Doctor
   ```

2. **If Login Fails**
   - Run seed script: `cd backend && node seed.js`
   - Try again

3. **For New Registrations**
   - Register new user
   - Check MongoDB for OTP
   - Or use temporary OTP bypass (123456)

### For Production Setup

1. Configure Gmail App Password
2. Update backend/.env
3. Restart backend
4. Test registration with real email

---

## 🐛 Troubleshooting

### "Invalid credentials" Error

**Cause:** User doesn't exist or password is wrong

**Solution:**
```cmd
cd backend
node seed.js
```

### "Please verify your email first" Error

**Cause:** User exists but not verified

**Solution:**
1. Check MongoDB for the user
2. Set `isVerified: true` manually
3. Or use the OTP from database

### OTP Not Received

**Cause:** Email not configured

**Solutions:**
1. Configure Gmail (see Solution 1 above)
2. Check MongoDB for OTP
3. Use temporary OTP bypass (123456)

---

## ✅ Quick Test Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Seed script executed
- [ ] Test login with doctor@test.com
- [ ] If login fails, re-run seed script
- [ ] For registration, either:
  - [ ] Configure Gmail, OR
  - [ ] Check MongoDB for OTP, OR
  - [ ] Use temporary OTP bypass

---

## 📞 Need Help?

### Check Backend Logs

Look at the backend terminal for errors when you try to login.

### Check Frontend Console

Press F12 in browser and check Console tab for errors.

### Verify API Connection

```cmd
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## 🎉 Once Working

After you get login working:
1. Explore the dashboards
2. Test different roles
3. Try the chatbot
4. Book appointments
5. Upload reports (as nurse)

---

**Quick Start Command:**
```cmd
# Terminal 1 - Backend
cd backend
node seed.js
npm start

# Terminal 2 - Frontend
npm run dev

# Then login with: doctor@test.com / test123
```
