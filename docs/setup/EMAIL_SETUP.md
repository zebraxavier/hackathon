# 📧 Email Configuration Guide

Complete guide for setting up email delivery for OTP verification.

## Overview

The platform supports multiple email delivery methods:
1. Gmail SMTP (Primary)
2. SendGrid API (Fallback)
3. Console Logging (Development)

## Method 1: Gmail SMTP (Recommended for Development)

### Step 1: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Clinical Platform"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Configure .env

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM="Clinical Platform <your_email@gmail.com>"
```

### Step 4: Test

```bash
cd backend
node test-otp.js
```

## Method 2: SendGrid API (Recommended for Production)

### Step 1: Sign Up

1. Go to https://sendgrid.com/
2. Sign up for free account (100 emails/day)
3. Verify your email

### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "Clinical Platform"
4. Select "Full Access"
5. Copy the API key

### Step 3: Configure .env

```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Step 4: Test

```bash
cd backend
node test-otp.js
```

## Method 3: Console Logging (Development Only)

Already configured! OTP will appear in backend console.

```bash
# Start backend
npm start

# Register a user - OTP will show in console
```

## Troubleshooting

### Gmail SMTP Not Working

**Issue:** Network/firewall blocks ports 587/465

**Solution:**
1. Use SendGrid API instead
2. Or deploy to cloud (Heroku, AWS, etc.)

### SendGrid Not Sending

**Issue:** Domain not verified

**Solution:**
1. Go to SendGrid → Settings → Sender Authentication
2. Verify your domain or single sender email

### OTP Not Received

**Check:**
1. Spam folder
2. Backend console for errors
3. Email address is correct
4. .env file is loaded (restart backend)

## Production Checklist

- [ ] Use SendGrid API (more reliable)
- [ ] Verify sender domain
- [ ] Set up email templates
- [ ] Configure rate limiting
- [ ] Monitor email delivery
- [ ] Set up bounce handling

## Email Flow

```
User Registration
    ↓
Generate 6-digit OTP
    ↓
Try Gmail SMTP (3 attempts)
    ↓ (if fails)
Try SendGrid API
    ↓ (if fails)
Log to console (dev mode)
    ↓
Store OTP in database
    ↓
User verifies OTP
```

## Configuration Reference

### Gmail SMTP Settings
```env
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### SendGrid API Settings
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

## Support

- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SendGrid Docs: https://docs.sendgrid.com/
- Project Issues: See backend console logs
