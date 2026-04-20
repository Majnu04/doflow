import nodemailer from 'nodemailer';

const THEME = {
  brand: '#E06438',
  brandHover: '#C7542F',
  accent: '#F3A45C',
  bg: '#FDFBF8',
  card: '#FFFFFF',
  border: '#E5DDD2',
  text: '#1F232E',
  textMuted: '#5A6072',
  chipBg: '#FFE4CC',
  warningBg: '#FFF4E5',
  warningBorder: '#F3A45C',
  dangerBg: '#FEECEC',
  dangerBorder: '#E06438',
  successBg: '#EAF9F0',
  successBorder: '#2A8F5A',
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getSenderName = () => process.env.EMAIL_FROM_NAME || 'DoFlow';
const getSupportEmail = () => process.env.SUPPORT_EMAIL || 'support@doflow.com';
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const renderEmailLayout = ({ preheader, badge, title, subtitle, bodyHtml, footerHtml }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: ${THEME.bg};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      color: ${THEME.text};
    }
    .preheader {
      display: none;
      visibility: hidden;
      opacity: 0;
      color: transparent;
      height: 0;
      width: 0;
      overflow: hidden;
      mso-hide: all;
    }
    .wrapper {
      width: 100%;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .card {
      max-width: 620px;
      margin: 0 auto;
      background: ${THEME.card};
      border: 1px solid ${THEME.border};
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 16px 34px rgba(32, 29, 25, 0.08);
    }
    .header {
      padding: 28px 28px 16px;
      background: linear-gradient(135deg, #fff 0%, #fff7ef 100%);
      border-bottom: 1px solid ${THEME.border};
    }
    .logo {
      display: inline-block;
      font-size: 22px;
      font-weight: 800;
      color: ${THEME.brand};
      letter-spacing: 0.2px;
      margin-bottom: 14px;
    }
    .chip {
      display: inline-block;
      background: ${THEME.chipBg};
      color: ${THEME.brand};
      border: 1px solid rgba(224, 100, 56, 0.28);
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 14px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.2;
      color: ${THEME.text};
    }
    .subtitle {
      margin: 0;
      font-size: 15px;
      line-height: 1.6;
      color: ${THEME.textMuted};
    }
    .content {
      padding: 24px 28px 28px;
      font-size: 15px;
      line-height: 1.7;
      color: ${THEME.text};
    }
    .footer {
      background: #fffaf4;
      border-top: 1px solid ${THEME.border};
      padding: 18px 28px 24px;
      font-size: 13px;
      color: ${THEME.textMuted};
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background: ${THEME.brand};
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      border-radius: 10px;
      padding: 12px 22px;
      margin: 12px 0 10px;
    }
    .muted {
      color: ${THEME.textMuted};
    }
    .code-box {
      margin: 18px 0;
      border: 1px dashed ${THEME.brand};
      border-radius: 12px;
      background: #fff7ef;
      text-align: center;
      padding: 16px 12px;
    }
    .code {
      margin: 8px 0;
      font-size: 34px;
      letter-spacing: 8px;
      font-weight: 800;
      color: ${THEME.brand};
    }
    .notice {
      border-radius: 10px;
      padding: 12px 14px;
      margin: 16px 0;
      border-left: 4px solid;
      font-size: 14px;
      line-height: 1.6;
    }
    .notice-warning {
      background: ${THEME.warningBg};
      border-color: ${THEME.warningBorder};
      color: #7a4a1a;
    }
    .notice-danger {
      background: ${THEME.dangerBg};
      border-color: ${THEME.dangerBorder};
      color: #7f1f1f;
    }
    .notice-success {
      background: ${THEME.successBg};
      border-color: ${THEME.successBorder};
      color: #1f5a3d;
    }
    .link-box {
      margin: 14px 0;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid ${THEME.border};
      background: #fdfaf6;
      word-break: break-all;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 12px;
      color: ${THEME.textMuted};
    }
    @media only screen and (max-width: 640px) {
      .header, .content, .footer {
        padding-left: 18px;
        padding-right: 18px;
      }
      h1 {
        font-size: 24px;
      }
      .code {
        font-size: 30px;
        letter-spacing: 6px;
      }
    }
  </style>
</head>
<body>
  <span class="preheader">${escapeHtml(preheader)}</span>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">DoFlow</div><br />
        <div class="chip">${escapeHtml(badge)}</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
      </div>
      <div class="content">
        ${bodyHtml}
      </div>
      <div class="footer">
        ${footerHtml}
      </div>
    </div>
  </div>
</body>
</html>
`;

const defaultFooterHtml = () => `
  <div>Need help? Contact us at <a href="mailto:${escapeHtml(getSupportEmail())}" style="color:${THEME.brand}; text-decoration:none;">${escapeHtml(getSupportEmail())}</a></div>
  <div style="margin-top:6px;">&copy; ${new Date().getFullYear()} DoFlow. All rights reserved.</div>
`;

const otpBodyHtml = ({ name, otp, contextLabel, actionLine }) => `
  <p>Hi ${escapeHtml(name || 'there')},</p>
  <p>${escapeHtml(actionLine)}</p>

  <div class="code-box">
    <div class="muted" style="font-size:13px;">${escapeHtml(contextLabel)}</div>
    <div class="code">${escapeHtml(otp)}</div>
    <div class="muted" style="font-size:12px;">Valid for 10 minutes</div>
  </div>

  <div class="notice notice-warning">
    <strong>Security tip:</strong> Never share this code with anyone. DoFlow support will never ask for your OTP.
  </div>
`;

const verificationBodyHtml = ({ name, verificationUrl }) => `
  <p>Hi ${escapeHtml(name || 'there')},</p>
  <p>Thanks for creating your DoFlow account. Please verify your email address to activate all features.</p>

  <p style="text-align:center; margin: 16px 0;">
    <a class="btn" href="${escapeHtml(verificationUrl)}">Verify Email</a>
  </p>

  <p class="muted" style="margin-bottom:8px;">If the button does not work, copy and paste this link:</p>
  <div class="link-box">${escapeHtml(verificationUrl)}</div>

  <div class="notice notice-warning">
    This verification link expires in 24 hours.
  </div>
`;

const passwordResetBodyHtml = ({ name, resetUrl }) => `
  <p>Hi ${escapeHtml(name || 'there')},</p>
  <p>We received a request to reset your password.</p>

  <p style="text-align:center; margin: 16px 0;">
    <a class="btn" href="${escapeHtml(resetUrl)}">Reset Password</a>
  </p>

  <p class="muted" style="margin-bottom:8px;">If the button does not work, copy and paste this link:</p>
  <div class="link-box">${escapeHtml(resetUrl)}</div>

  <div class="notice notice-danger">
    <strong>Important:</strong>
    <ul style="margin:8px 0 0 18px; padding:0;">
      <li>This link expires in 1 hour.</li>
      <li>If you did not request this reset, you can safely ignore this email.</li>
      <li>Your password remains unchanged until you complete the reset.</li>
    </ul>
  </div>
`;

const welcomeBodyHtml = ({ name }) => `
  <p>Hi ${escapeHtml(name || 'there')},</p>
  <p>Your account is now active. Welcome to DoFlow.</p>

  <div class="notice notice-success">
    You can now access courses, learning paths, coding practice, and certificates.
  </div>

  <p style="text-align:center; margin: 16px 0;">
    <a class="btn" href="${escapeHtml(`${getFrontendUrl()}/#/courses`)}">Explore Courses</a>
  </p>

  <p class="muted">We are excited to be part of your learning journey.</p>
`;

// Create transporter
const createTransporter = () => {
  // Check if email service is configured
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env');
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
    console.log('Password reset OTP email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${getSenderName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'DoFlow password reset code',
    html: renderEmailLayout({
      preheader: 'Your password reset code for DoFlow',
      badge: 'Password Reset',
      title: 'Reset your password',
      subtitle: 'Use the one-time code below to continue securely.',
      bodyHtml: `${otpBodyHtml({
        name,
        otp,
        contextLabel: 'Password reset code',
        actionLine: 'Use this one-time code to set a new password for your account.',
      })}
      <div class="notice notice-danger">
        If you did not request a password reset, please ignore this email and review your account security.
      </div>`,
      footerHtml: defaultFooterHtml(),
    }),
    text: `Password reset code: ${otp}\n\nThis code is valid for 10 minutes. If you did not request this, ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset OTP sent to: ${email}`);
    return { success: true, message: 'Password reset OTP sent successfully' };
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return { success: false, message: 'Failed to send password reset OTP email' };
  }
};

// Send OTP for registration
export const sendRegistrationOTP = async (email, name, otp) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('OTP email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${getSenderName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'DoFlow registration code',
    html: renderEmailLayout({
      preheader: 'Your DoFlow registration OTP',
      badge: 'Email Verification',
      title: 'Complete your sign up',
      subtitle: 'Enter this one-time code to verify your email and activate your account.',
      bodyHtml: otpBodyHtml({
        name,
        otp,
        contextLabel: 'Registration code',
        actionLine: 'Thanks for joining DoFlow. Use the code below to complete registration.',
      }),
      footerHtml: defaultFooterHtml(),
    }),
    text: `Registration OTP: ${otp}\n\nThis code is valid for 10 minutes. Do not share it with anyone.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration OTP sent to: ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
};

// Send email verification
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('Email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const verificationUrl = `${getFrontendUrl()}/#/verify-email/${verificationToken}`;

  const mailOptions = {
    from: `"${getSenderName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your DoFlow email',
    html: renderEmailLayout({
      preheader: 'Verify your email to activate your DoFlow account',
      badge: 'Account Verification',
      title: 'Verify your email',
      subtitle: 'One quick step to finish setting up your account.',
      bodyHtml: verificationBodyHtml({ name, verificationUrl }),
      footerHtml: defaultFooterHtml(),
    }),
    text: `Verify your DoFlow account by visiting: ${verificationUrl}\n\nThis link expires in 24 hours.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, message: 'Failed to send verification email', error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('Password reset email would be sent to:', email, '(Email service not configured)');
    return { success: false, message: 'Email service not configured' };
  }

  const resetUrl = `${getFrontendUrl()}/#/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"${getSenderName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your DoFlow password',
    html: renderEmailLayout({
      preheader: 'Reset your DoFlow password securely',
      badge: 'Password Reset',
      title: 'Password reset request',
      subtitle: 'Use the secure link below to choose a new password.',
      bodyHtml: passwordResetBodyHtml({ name, resetUrl }),
      footerHtml: defaultFooterHtml(),
    }),
    text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
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
    from: `"${getSenderName()}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to DoFlow',
    html: renderEmailLayout({
      preheader: 'Your DoFlow account is ready',
      badge: 'Welcome',
      title: 'Your account is ready',
      subtitle: 'You can now start learning with DoFlow.',
      bodyHtml: welcomeBodyHtml({ name }),
      footerHtml: defaultFooterHtml(),
    }),
    text: `Welcome to DoFlow, ${name || 'there'}! Your account is ready. Start learning here: ${getFrontendUrl()}/#/courses`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false };
  }
};
