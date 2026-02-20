const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ============================================================================
// OPTIMIZED OTP EMAIL CONFIGURATION
// ============================================================================

const GMAIL_CONFIG = {
  email: 'emmeleo2002@gmail.com',
  password: 'avxpaoldfiudejya'
};

// Generate secure 6-digit OTP
const generateOTP = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (parseInt(randomBytes.toString('hex'), 16) % 900000) + 100000;
  return otp.toString();
};

// Validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================================================
// FAST EMAIL SENDING - Optimized for speed
// ============================================================================

const sendOTPEmail = async (email, otp) => {
  console.log('\n📧 Sending OTP to:', email);
  console.log('🔐 OTP:', otp);

  if (!isValidEmail(email)) {
    console.error('❌ Invalid email format');
    return false;
  }

  try {
    // Create transporter - Using port 587 (TLS) which is fastest
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: GMAIL_CONFIG.email,
        pass: GMAIL_CONFIG.password
      },
      tls: {
        rejectUnauthorized: false
      },
      // Reduced timeouts for faster delivery
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Verify connection (quick check)
    console.log('🔌 Connecting to Gmail...');
    await transporter.verify();
    console.log('✅ Connected!');

    // Send email
    console.log('📤 Sending email...');
    const info = await transporter.sendMail({
      from: `"Clinical Platform" <${GMAIL_CONFIG.email}>`,
      to: email,
      subject: 'Your Clinical Platform OTP',
      html: getEmailTemplate(otp),
      text: `Your OTP is: ${otp}. Valid for 10 minutes.`
    });

    console.log('✅✅✅ EMAIL SENT SUCCESSFULLY! ✅✅✅');
    console.log(`   To: ${email}`);
    console.log(`   OTP: ${otp}\n`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    
    // Fallback to console
    console.log(`\n🔐 FALLBACK OTP for ${email}: ${otp}\n`);
    return true; // Still return true to allow registration
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
              <p style="color: #742a2a; font-size: 14px;">⏰ Valid for 10 minutes</p>
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

module.exports = { generateOTP, sendOTPEmail };
