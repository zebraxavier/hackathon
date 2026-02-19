# Email Configuration Guide for OTP Delivery

## Overview
This guide explains how to configure email delivery for OTP (One-Time Password) verification in the Clinical Platform.

## Current Status
- **Development Mode**: OTP is logged to console, test OTP "123456" works automatically
- **Production Mode**: Requires proper email configuration to send real emails

---

## Quick Start (Development)

For testing without email setup:
1. Leave `.env` file with placeholder values
2. Start the backend: `npm start`
3. Register a new user
4. Check console for OTP: `🔐 DEVELOPMENT OTP for user@example.com: 123456`
5. Use test OTP `123456` for verification

---

## Production Setup

### Option 1: Gmail (Recommended)

#### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" as the app
3. Select "Other" as the device and name it "Clinical Platform"
4. Click "Generate"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

#### Step 3: Update .env File
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```
**Note**: Remove spaces from the App Password

#### Step 4: Test Configuration
```bash
cd backend
npm start
```
Register a new user and check if email is received.

---

### Option 2: Outlook/Hotmail

#### Step 1: Update .env File
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_regular_password
```

#### Step 2: Enable SMTP Access
1. Go to [Outlook Settings](https://outlook.live.com/mail/options/mail/accounts)
2. Ensure "Let devices and apps use POP" is enabled
3. If you have 2FA enabled, create an App Password

#### Step 3: Test Configuration
```bash
cd backend
npm start
```

---

### Option 3: Custom SMTP Server

For other email providers (Yahoo, custom domain, etc.):

```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your.email@domain.com
EMAIL_PASSWORD=your_password
```

Common SMTP settings:
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Zoho**: `smtp.zoho.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

---

## Troubleshooting

### Issue 1: "Invalid login" or "Authentication failed"

**For Gmail:**
- Verify 2-Step Verification is enabled
- Use App Password, not regular password
- Remove spaces from App Password
- Check if "Less secure app access" is disabled (should be)

**For Outlook:**
- Use regular password (or App Password if 2FA enabled)
- Verify SMTP access is enabled in settings

### Issue 2: "Connection timeout"

**Solutions:**
- Check firewall/antivirus blocking port 587
- Try port 465 with `secure: true` in transporter config
- Verify internet connection
- Check if ISP blocks SMTP ports

### Issue 3: "Self-signed certificate" error

**Solution:**
Already handled in code with `rejectUnauthorized: false` for development.

For production, use proper SSL certificates.

### Issue 4: Email goes to spam

**Solutions:**
- Add SPF record to your domain
- Use a verified sender email
- Avoid spam trigger words in email content
- Use a dedicated email service (SendGrid, Mailgun)

---

## Testing Email Delivery

### Method 1: Console Logs
Check backend console for detailed logs:
```
📧 Attempting to send OTP to user@example.com (Attempt 1/3)...
✅ OTP sent successfully to user@example.com
📬 Message ID: <abc123@gmail.com>
📊 Response: 250 2.0.0 OK
```

### Method 2: Test Registration
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm run dev`
3. Register with your real email
4. Check email inbox (and spam folder)

### Method 3: Direct API Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your.email@gmail.com",
    "password": "test123",
    "phone": "1234567890"
  }'
```

---

## Security Best Practices

1. **Never commit .env file** - Already in `.gitignore`
2. **Use App Passwords** - More secure than regular passwords
3. **Rotate credentials** - Change passwords periodically
4. **Use environment variables** - Never hardcode credentials
5. **Enable rate limiting** - Prevent OTP abuse (already implemented)
6. **Monitor logs** - Check for suspicious activity

---

## Rate Limiting

OTP requests are rate-limited to prevent abuse:
- Max 5 requests per 15 minutes per IP
- Max 3 requests per 15 minutes per email
- Automatic blocking after threshold

---

## Development vs Production

### Development Mode (Current)
- OTP logged to console
- Test OTP "123456" always works
- No email credentials required
- Placeholder values in .env

### Production Mode
- Real emails sent via SMTP
- Test OTP disabled
- Valid email credentials required
- Proper error handling and retry mechanism

---

## Email Template

The OTP email includes:
- Professional HTML design
- Large, readable OTP code
- 10-minute expiration notice
- Security warning
- Responsive layout

---

## Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify .env configuration
3. Test with a different email provider
4. Check firewall/antivirus settings
5. Review troubleshooting section above

---

## Advanced Configuration

### Custom Email Template
Edit `backend/utils/sendOTP.js` to customize the email HTML.

### Different SMTP Port
- Port 587: TLS (recommended)
- Port 465: SSL
- Port 25: Unencrypted (not recommended)

### OAuth2 Authentication
For enhanced security, consider implementing OAuth2 instead of App Passwords.

---

## Summary

✅ Development: Works out of the box with console logging  
✅ Production: Requires Gmail App Password or Outlook credentials  
✅ Security: Rate limiting, retry mechanism, detailed logging  
✅ Reliability: 3 retry attempts with exponential backoff  
✅ Monitoring: Comprehensive console logs for debugging
