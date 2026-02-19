const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');

// ============================================================================
// PRODUCTION-GRADE OTP EMAIL SYSTEM WITH MULTIPLE DELIVERY METHODS
// Supports: Gmail SMTP, SendGrid API, Console Fallback
// ============================================================================

// Generate secure 6-digit OTP using crypto
const generateOTP = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (parseInt(randomBytes.toString('hex'), 16) % 900000) + 100000;
  return otp.toString();
};

// Validate email address format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ============================================================================
// METHOD 1: GMAIL SMTP (Primary Method)
// ============================================================================

const createGmailTransporter = () => {
  const config = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : ''
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
  };

  return nodemailer.createTransport(config);
};

const sendViaGmailSMTP = async (email, otp, attempt = 1) => {
  try {
    console.log(`\n📧 [ATTEMPT ${attempt}] Trying Gmail SMTP...`);
    
    const transporter = createGmailTransporter();
    
    // Verify connection
    console.log('   🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('   ✅ SMTP connection verified');
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Clinical Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Clinical Platform OTP Verification Code',
      html: getEmailTemplate(otp),
      text: `Your OTP verification code is: ${otp}. This code will expire in 10 minutes.`
    };
    
    console.log('   📤 Sending email via Gmail SMTP...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ ✅ ✅ EMAIL SENT SUCCESSFULLY (Gmail SMTP) ✅ ✅ ✅');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    console.log(`   To: ${email}`);
    console.log(`   OTP: ${otp}\n`);
    
    return { success: true, method: 'Gmail SMTP', messageId: info.messageId };
    
  } catch (error) {
    console.error(`   ❌ Gmail SMTP failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// METHOD 2: SENDGRID API (Fallback Method)
// ============================================================================

const sendViaSendGrid = async (email, otp, attempt = 1) => {
  try {
    console.log(`\n📧 [ATTEMPT ${attempt}] Trying SendGrid API...`);
    
    if (!process.env.SENDGRID_API_KEY) {
      console.log('   ⚠️  SendGrid API key not configured');
      return { success: false, error: 'SendGrid not configured' };
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'emmeleo2002@gmail.com',
      subject: 'Your Clinical Platform OTP Verification Code',
      html: getEmailTemplate(otp),
      text: `Your OTP verification code is: ${otp}. This code will expire in 10 minutes.`
    };
    
    console.log('   📤 Sending email via SendGrid API...');
    const response = await sgMail.send(msg);
    
    console.log('\n✅ ✅ ✅ EMAIL SENT SUCCESSFULLY (SendGrid) ✅ ✅ ✅');
    console.log(`   Status: ${response[0].statusCode}`);
    console.log(`   To: ${email}`);
    console.log(`   OTP: ${otp}\n`);
    
    return { success: true, method: 'SendGrid API', statusCode: response[0].statusCode };
    
  } catch (error) {
    console.error(`   ❌ SendGrid failed: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response.body)}`);
    }
    return { success: false, error: error.message };
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">🏥 Clinical Platform</h1>
                  <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Secure Email Verification</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1a202c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Email Verification Required</h2>
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Thank you for registering with our AI-Powered Clinical Platform. To complete your registration, please use the verification code below:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 30px 0;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 30px; display: inline-block;">
                          <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Your OTP Code</p>
                          <p style="color: #ffffff; font-size: 48px; font-weight: bold; margin: 0; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div style="background-color: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <p style="color: #742a2a; font-size: 14px; margin: 0; font-weight: 600;">⏰ Important:</p>
                    <p style="color: #742a2a; font-size: 14px; margin: 10px 0 0 0; line-height: 1.5;">
                      This verification code will expire in <strong>10 minutes</strong>. Please enter it promptly to complete your registration.
                    </p>
                  </div>
                  <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #2d3748; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">🔒 Security Notice:</p>
                    <ul style="color: #4a5568; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Never share this code with anyone</li>
                      <li>Our team will never ask for your OTP</li>
                      <li>If you didn't request this code, please ignore this email</li>
                    </ul>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #718096; font-size: 13px; margin: 0 0 10px 0;">
                    This is an automated message from AI-Powered Clinical Platform
                  </p>
                  <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Clinical Platform. All rights reserved.
                  </p>
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

// ============================================================================
// MAIN SEND FUNCTION WITH MULTIPLE FALLBACKS
// ============================================================================

const sendOTPEmail = async (email, otp) => {
  console.log('\n' + '='.repeat(70));
  console.log('📧 OTP EMAIL DELIVERY SYSTEM - PRODUCTION MODE');
  console.log('='.repeat(70));
  console.log(`   Recipient: ${email}`);
  console.log(`   OTP: ${otp}`);
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  // Validate email format
  if (!isValidEmail(email)) {
    console.error('❌ Invalid email format');
    return false;
  }
  console.log('✅ Email format validated');

  // Check if credentials are configured
  const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS && 
                         !process.env.EMAIL_PASS.includes('YOUR_GOOGLE_APP_PASSWORD');
  const hasSendGridConfig = process.env.SENDGRID_API_KEY && 
                            !process.env.SENDGRID_API_KEY.includes('YOUR_SENDGRID_API_KEY');

  if (!hasGmailConfig && !hasSendGridConfig) {
    console.warn('\n⚠️  NO EMAIL SERVICE CONFIGURED');
    console.warn('   Neither Gmail SMTP nor SendGrid API is configured');
    console.warn('   Falling back to DEVELOPMENT MODE');
    console.log(`\n🔐 DEVELOPMENT OTP for ${email}: ${otp}\n`);
    
    if (process.env.NODE_ENV === 'development') {
      return true; // Allow registration to continue in development
    }
    return false;
  }

  // Try multiple delivery methods with retries
  const maxRetries = 3;
  
  // Method 1: Try Gmail SMTP (if configured)
  if (hasGmailConfig) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await sendViaGmailSMTP(email, otp, attempt);
      if (result.success) {
        // Log OTP in development for backup
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEVELOPMENT BACKUP OTP: ${otp}\n`);
        }
        return true;
      }
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`   ⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    console.log('   ❌ Gmail SMTP failed after all retries');
  }

  // Method 2: Try SendGrid API (if configured)
  if (hasSendGridConfig) {
    console.log('\n🔄 Switching to SendGrid API fallback...');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await sendViaSendGrid(email, otp, attempt);
      if (result.success) {
        // Log OTP in development for backup
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 DEVELOPMENT BACKUP OTP: ${otp}\n`);
        }
        return true;
      }
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`   ⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    console.log('   ❌ SendGrid API failed after all retries');
  }

  // All methods failed
  console.error('\n❌ ❌ ❌ ALL EMAIL DELIVERY METHODS FAILED ❌ ❌ ❌');
  console.error('\n📋 TROUBLESHOOTING:');
  console.error('   1. Check your internet connection');
  console.error('   2. Verify firewall is not blocking ports 587/465/443');
  console.error('   3. Confirm Gmail App Password is correct (no spaces)');
  console.error('   4. Try configuring SendGrid as backup');
  console.error('   5. Check antivirus/firewall settings');
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔐 DEVELOPMENT FALLBACK OTP for ${email}: ${otp}`);
    console.log('   ℹ️  Registration will continue with console OTP\n');
    return true; // Allow registration to continue
  }

  console.log('\n' + '='.repeat(70) + '\n');
  return false;
};

module.exports = { generateOTP, sendOTPEmail };
