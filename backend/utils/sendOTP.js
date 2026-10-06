const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { isProduction } = require('../config/env');

// OTP lifetime, shared by the route that stores it and the email that states it.
const OTP_TTL_MINUTES = 10;

// Generate a cryptographically secure 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

// OTPs are stored hashed so a database leak does not expose live codes.
const hashOTP = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const isEmailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }
  return transporter;
};

// Sends the OTP email. Returns true when the user can obtain the code.
// Outside production, when SMTP is not configured or fails, the OTP is printed
// to the server console so local development works without an email account.
const sendOTPEmail = async (email, otp) => {
  if (!isEmailConfigured()) {
    if (isProduction()) {
      console.error('❌ Email is not configured (EMAIL_USER / EMAIL_PASS); cannot send OTP');
      return false;
    }
    console.log(`🔐 [dev] OTP for ${email}: ${otp}`);
    return true;
  }

  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || `"Clinical Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Clinical Platform verification code',
      html: getEmailTemplate(otp),
      text: `Your verification code is: ${otp}. It is valid for ${OTP_TTL_MINUTES} minutes.`
    });
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP email: ${error.message}`);
    if (isProduction()) return false;
    console.log(`🔐 [dev] OTP for ${email}: ${otp}`);
    return true;
  }
};

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

const getEmailTemplate = (otp) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">🏥 Clinical Platform</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0;">Your OTP Code</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="color: #4a5568; font-size: 16px;">Your verification code:</p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px 50px; display: inline-block; margin: 20px 0;">
                <p style="color: #ffffff; font-size: 42px; font-weight: bold; margin: 0; letter-spacing: 12px;">${otp}</p>
              </div>
              <p style="color: #742a2a; font-size: 14px;">⏰ Valid for ${OTP_TTL_MINUTES} minutes</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

module.exports = { generateOTP, hashOTP, sendOTPEmail, OTP_TTL_MINUTES };
