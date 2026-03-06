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
    subject: 'Password Reset OTP - DoFlow Academy',
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
          .otp-box {
            background: #f8f9fa;
            border: 2px dashed #dc3545;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #dc3545;
            letter-spacing: 8px;
            margin: 10px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 DoFlow Academy</h1>
          </div>
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}! 👋</h2>
            <p>We received a request to reset your password. Use the OTP code below to set a new password:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your Password Reset OTP</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>

            <div class="alert">
              <strong>⚠️ Security Alert:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
            </div>

            <div class="warning">
              <strong>🔐 Important:</strong> Never share this OTP with anyone, including DoFlow staff. We will never ask for your OTP.
            </div>

            <p style="color: #666; margin-top: 20px;">
              This OTP will expire in 10 minutes. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} DoFlow Academy. All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact us at <a href="mailto:support@doflow.com" style="color: #667eea;">support@doflow.com</a></p>
          </div>
        </div>
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
    subject: 'Your Registration OTP - DoFlow Academy',
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
          .otp-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 10px 0;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 DoFlow Academy</h1>
          </div>
          <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${name}! 👋</h2>
            <p>Thank you for signing up with DoFlow Academy! To complete your registration, please use the OTP code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; font-size: 12px; color: #999;">Valid for 10 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. DoFlow staff will never ask for your OTP.
            </div>

            <p style="color: #666; margin-top: 20px;">
              If you didn't request this registration, please ignore this email.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} DoFlow Academy. All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact us at <a href="mailto:support@doflow.com" style="color: #667eea;">support@doflow.com</a></p>
          </div>
        </div>
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
    subject: 'Welcome to DoFlow Academy! 🎉',
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
            padding: 40px;
            text-align: center;
            color: white;
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
          .feature-box {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #667eea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to DoFlow!</h1>
          </div>
          <div class="content">
            <h2>Your Learning Journey Begins Now, ${name}! 🚀</h2>
            <p>Your email has been verified successfully. You're all set to start learning!</p>
            
            <h3>What You Can Do Now:</h3>
            
            <div class="feature-box">
              <strong>📚 Browse Courses</strong><br>
              Explore our extensive library of courses in web development, data science, and more.
            </div>
            
            <div class="feature-box">
              <strong>💻 Practice DSA</strong><br>
              Access our Data Structures & Algorithms roadmap with 180+ practice problems.
            </div>
            
            <div class="feature-box">
              <strong>🎓 Earn Certificates</strong><br>
              Complete courses and earn industry-recognized certificates.
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/courses" class="button">Start Learning Now</a>
            </div>
            
            <p>Need help? Our support team is here for you 24/7 at support@doflow.academy</p>
            
            <p>Happy Learning!<br>The DoFlow Team 💜</p>
          </div>
        </div>
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

