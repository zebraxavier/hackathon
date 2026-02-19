# 📚 Documentation Index

Complete documentation for the AI-Powered Clinical Web Platform.

## 🚀 Getting Started

### Quick Start
- [Quick Start Guide](setup/QUICK_START.md) - Get up and running in 5 minutes
- [Production Deployment](setup/PRODUCTION_DEPLOYMENT.md) - Deploy to production

### Configuration
- [Email Setup Guide](setup/EMAIL_SETUP.md) - Configure email delivery (Gmail/SendGrid)
- [OTP Quick Reference](setup/OTP_QUICK_REFERENCE.md) - OTP system overview
- [Gmail App Password Setup](setup/GMAIL_APP_PASSWORD_SETUP.md) - Gmail configuration
- [SendGrid Setup](setup/SENDGRID_QUICK_SETUP.md) - SendGrid configuration

## ✨ Features

### AI Chatbot
- [AI Chatbot Documentation](features/AI_CHATBOT.md) - Complete AI chatbot guide
- [AI Model Update](features/AI_MODEL_UPDATE.md) - Model update details
- [AI Integration Status](features/AI_INTEGRATION_FINAL_STATUS.md) - Integration status

### Core Features
- [API Endpoints](../backend/API_ENDPOINTS.md) - Complete API documentation
- [Backend README](../backend/README.md) - Backend documentation

## 🧪 Testing

- [Testing Guide](testing/TESTING_GUIDE.md) - Complete testing guide
- [QA Summary](testing/QA_SUMMARY.md) - Quality assurance results

## 📖 Reference

### Main Documentation
- [README](../README.md) - Project overview
- [Current Status](../CURRENT_STATUS.md) - System status
- [Attributions](../ATTRIBUTIONS.md) - Credits and licenses

### Setup Files
- [OTP Solution](setup/FINAL_OTP_SOLUTION.md) - OTP implementation details
- [SendGrid Integration](setup/SENDGRID_INTEGRATION_GUIDE.md) - SendGrid guide

## 📦 Archive

Historical documentation and detailed reports:
- [Archive Folder](archive/) - Old documentation and detailed reports

## 🔍 Quick Links

### For Developers
1. [Quick Start](setup/QUICK_START.md)
2. [API Documentation](../backend/API_ENDPOINTS.md)
3. [Testing Guide](testing/TESTING_GUIDE.md)
4. [AI Chatbot Guide](features/AI_CHATBOT.md)

### For DevOps
1. [Production Deployment](setup/PRODUCTION_DEPLOYMENT.md)
2. [Email Configuration](setup/EMAIL_SETUP.md)
3. [Current Status](../CURRENT_STATUS.md)

### For QA
1. [Testing Guide](testing/TESTING_GUIDE.md)
2. [QA Summary](testing/QA_SUMMARY.md)

## 📝 Documentation Structure

```
docs/
├── INDEX.md (this file)
├── setup/
│   ├── QUICK_START.md
│   ├── PRODUCTION_DEPLOYMENT.md
│   ├── EMAIL_SETUP.md
│   ├── OTP_QUICK_REFERENCE.md
│   ├── GMAIL_APP_PASSWORD_SETUP.md
│   ├── SENDGRID_QUICK_SETUP.md
│   ├── SENDGRID_INTEGRATION_GUIDE.md
│   └── FINAL_OTP_SOLUTION.md
├── features/
│   ├── AI_CHATBOT.md
│   ├── AI_MODEL_UPDATE.md
│   └── AI_INTEGRATION_FINAL_STATUS.md
├── testing/
│   ├── TESTING_GUIDE.md
│   └── QA_SUMMARY.md
└── archive/
    └── (historical documentation)
```

## 🆘 Getting Help

### Common Issues
1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `.env`

2. **AI Chatbot Not Working**
   - Verify `AI_API_KEY` in `backend/.env`
   - Test with: `node backend/test-ai-chatbot.js`

3. **Email Not Sending**
   - Check [Email Setup Guide](setup/EMAIL_SETUP.md)
   - Use console logging for development
   - Add SendGrid for production

4. **Login Issues**
   - Seed test users: `node backend/seed.js`
   - Check MongoDB connection
   - Verify JWT_SECRET in `.env`

### Support Resources
- Backend Console Logs
- Browser Developer Console
- [Testing Guide](testing/TESTING_GUIDE.md)
- [Current Status](../CURRENT_STATUS.md)

## 🔄 Updates

This documentation is maintained and updated regularly. Last update: February 20, 2026.

For the latest information, always check:
- [CURRENT_STATUS.md](../CURRENT_STATUS.md)
- [README.md](../README.md)

## 📄 License

See [ATTRIBUTIONS.md](../ATTRIBUTIONS.md) for license information.
