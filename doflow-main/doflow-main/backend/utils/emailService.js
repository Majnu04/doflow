import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // Check if email service is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (email, name, otp) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Password reset OTP email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DoFlow Academy'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Verification Code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
        <!-- Email Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Card -->
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
                
                <!-- Header Section -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); padding: 48px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">DoFlow</h1>
                    <p style="margin: 12px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 400;">Professional Learning Platform</p>
                  </td>
                </tr>

                <!-- Content Section -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #1a1f36; line-height: 1.3;">Password Reset Request</h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #697386; line-height: 1.6;">Hello ${name},</p>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #697386; line-height: 1.6;">We received a request to reset your password. Please use the verification code below to proceed with resetting your password:</p>
                    
                    <!-- OTP Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border: 2px solid #f3a45c; border-radius: 8px; padding: 32px; text-align: center;">
                          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #8896ab; text-transform: uppercase; letter-spacing: 0.5px;">Verification Code</p>
                          <p style="margin: 0 0 12px 0; font-size: 42px; font-weight: 700; color: #e06438; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</p>
                          <p style="margin: 0; font-size: 13px; color: #8896ab;">Expires in 10 minutes</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td style="background-color: #fef5f5; border-left: 4px solid #e63946; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #c53030;">Security Alert</p>
                          <p style="margin: 0; font-size: 14px; color: #5a2626; line-height: 1.5;">If you did not request a password reset, please secure your account immediately and contact our support team.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border-left: 4px solid #e06438; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1f36;">Keep This Secure</p>
                          <p style="margin: 0; font-size: 14px; color: #4e5d78; line-height: 1.5;">Never share this code with anyone. DoFlow staff will never ask for your verification code.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/forgot-password" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(224, 100, 56, 0.3);">Reset Password</a>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/help" style="display: inline-block; color: #e06438; text-decoration: none; font-size: 14px; font-weight: 500;">Need Help? Contact Support</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer Section -->
                <tr>
                  <td style="background-color: #fef8f5; padding: 32px 40px; border-top: 1px solid #e3e8ef;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1f36;">DoFlow Academy</p>
                          <p style="margin: 0 0 16px 0; font-size: 13px; color: #8896ab;">Professional Online Learning Platform</p>
                          <p style="margin: 0 0 12px 0; font-size: 13px; color: #8896ab;">
                            <a href="mailto:support@doflow.academy" style="color: #e06438; text-decoration: none;">support@doflow.academy</a>
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #adb5c4;">© ${new Date().getFullYear()} DoFlow Academy. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset OTP sent to: ${email}`);
    return { success: true, message: 'Password reset OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending password reset OTP:', error);
    return { success: false, message: 'Failed to send password reset OTP email' };
  }
};

// Send OTP for registration
export const sendRegistrationOTP = async (email, name, otp) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 OTP email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DoFlow Academy'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Complete Your Registration',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Registration</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); padding: 48px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">DoFlow</h1>
                    <p style="margin: 12px 0 0 0; font-size: 15px; color: rgba(255, 255, 255, 0.9); font-weight: 400;">Professional Learning Platform</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #1a1f36; line-height: 1.3;">Welcome to DoFlow!</h2>
                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #697386; line-height: 1.6;">Hello ${name},</p>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #697386; line-height: 1.6;">Thank you for joining DoFlow Academy. To complete your registration and start your learning journey, please verify your email using the code below:</p>
                    
                    <!-- OTP Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border: 2px solid #f3a45c; border-radius: 8px; padding: 32px; text-align: center;">
                          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #8896ab; text-transform: uppercase; letter-spacing: 0.5px;">Verification Code</p>
                          <p style="margin: 0 0 12px 0; font-size: 42px; font-weight: 700; color: #e06438; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</p>
                          <p style="margin: 0; font-size: 13px; color: #8896ab;">Expires in 10 minutes</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Info Notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border-left: 4px solid #e06438; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1f36;">Keep This Secure</p>
                          <p style="margin: 0; font-size: 14px; color: #4e5d78; line-height: 1.5;">Never share this code with anyone. DoFlow staff will never ask for your verification code.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(224, 100, 56, 0.3);">Go to Dashboard</a>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/courses" style="display: inline-block; color: #e06438; text-decoration: none; font-size: 14px; font-weight: 500;">Browse Courses</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef8f5; padding: 32px 40px; border-top: 1px solid #e3e8ef;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1f36;">DoFlow Academy</p>
                          <p style="margin: 0 0 16px 0; font-size: 13px; color: #8896ab;">Professional Online Learning Platform</p>
                          <p style="margin: 0 0 12px 0; font-size: 13px; color: #8896ab;">
                            <a href="mailto:support@doflow.academy" style="color: #e06438; text-decoration: none;">support@doflow.academy</a>
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #adb5c4;">© ${new Date().getFullYear()} DoFlow Academy. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Registration OTP sent to: ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};

// Send email verification
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DoFlow Academy'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - DoFlow Academy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            background: #f8f8f8;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .code {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 2px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 DoFlow Academy</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}! 👋</h2>
            <p>Thank you for signing up with DoFlow Academy. We're excited to have you on board!</p>
            <p>To complete your registration and start learning, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="code">${verificationUrl}</div>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <p>If you didn't create an account with DoFlow Academy, please ignore this email.</p>
            
            <p>Best regards,<br>The DoFlow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 DoFlow Academy. All rights reserved.</p>
            <p>You're receiving this email because you signed up for DoFlow Academy.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to DoFlow Academy, ${name}!
      
      Thank you for signing up. Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, please ignore this email.
      
      Best regards,
      The DoFlow Team
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('📧 Password reset email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DoFlow Academy'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - DoFlow Academy',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            background: #f8f8f8;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}</h2>
            <p>We received a request to reset your password for your DoFlow Academy account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request a password reset, please ignore this email</li>
                <li>Your password will remain unchanged unless you click the link above</li>
              </ul>
            </div>
            
            <p>If you're having trouble, contact our support team at support@doflow.academy</p>
            
            <p>Best regards,<br>The DoFlow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 DoFlow Academy. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request - DoFlow Academy
      
      Hello ${name},
      
      We received a request to reset your password. Click the link below to reset it:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
      
      Best regards,
      The DoFlow Team
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, message: 'Failed to send password reset email', error: error.message };
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'DoFlow Academy'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to DoFlow Academy',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DoFlow</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f7fa; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); padding: 56px 40px; text-align: center;">
                    <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">Welcome to DoFlow</h1>
                    <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.95); font-weight: 400;">Your learning journey starts today</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; color: #1a1f36; line-height: 1.3;">Hello ${name},</h2>
                    <p style="margin: 0 0 32px 0; font-size: 15px; color: #697386; line-height: 1.6;">Your email has been verified successfully. You now have full access to our platform and all its features. We're excited to support you on your learning journey.</p>
                    
                    <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1a1f36;">What's available to you:</h3>

                    <!-- Feature Boxes -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 16px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border-left: 4px solid #e06438; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1a1f36;">Comprehensive Course Library</p>
                          <p style="margin: 0; font-size: 14px; color: #4e5d78; line-height: 1.5;">Access hundreds of courses in web development, data science, and emerging technologies.</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 16px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border-left: 4px solid #f3a45c; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1a1f36;">DSA Practice Platform</p>
                          <p style="margin: 0; font-size: 14px; color: #4e5d78; line-height: 1.5;">Master data structures and algorithms with 180+ curated problems and detailed solutions.</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px 0;">
                      <tr>
                        <td style="background-color: #fef8f5; border-left: 4px solid #e06438; border-radius: 6px; padding: 20px 20px 20px 24px;">
                          <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #1a1f36;">Professional Certificates</p>
                          <p style="margin: 0; font-size: 14px; color: #4e5d78; line-height: 1.5;">Earn industry-recognized certificates to showcase your skills and advance your career.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/courses" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #e06438 0%, #f3a45c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(224, 100, 56, 0.3);">Start Learning</a>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                      <tr>
                        <td align="center">
                          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/dashboard" style="display: inline-block; color: #e06438; text-decoration: none; font-size: 14px; font-weight: 500;">View Dashboard</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 14px; color: #697386; line-height: 1.6; text-align: center;">If you need any assistance, our support team is available 24/7.</p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fef8f5; padding: 32px 40px; border-top: 1px solid #e3e8ef;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1f36;">DoFlow Academy</p>
                          <p style="margin: 0 0 16px 0; font-size: 13px; color: #8896ab;">Professional Online Learning Platform</p>
                          <p style="margin: 0 0 12px 0; font-size: 13px; color: #8896ab;">
                            <a href="mailto:support@doflow.academy" style="color: #e06438; text-decoration: none;">support@doflow.academy</a>
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #adb5c4;">© ${new Date().getFullYear()} DoFlow Academy. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false };
  }
};

