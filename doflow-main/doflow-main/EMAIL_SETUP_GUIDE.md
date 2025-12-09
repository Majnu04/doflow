# 📧 Email Verification & Password Reset Setup Guide

## ✅ Implementation Complete

Your DoFlow application now has full email verification and password reset functionality!

## 🎯 Features Implemented

### 1. **Email Verification on Signup**
- Users receive a verification email after registration
- Email contains a unique token valid for 24 hours
- Beautiful HTML email template with branding
- **Users CAN login without verification** (verification is tracked in database)
- Email verification status stored as `isEmailVerified` field
- Option to resend verification email

### 2. **Password Reset Flow**
- Users can request password reset via email
- Reset token expires in 1 hour for security
- Secure token hashing using SHA-256
- User-friendly reset password page

### 3. **Email Pages Created**
- `/verify-email/:token` - Verify email page
- `/resend-verification` - Resend verification email
- `/forgot-password` - Request password reset
- `/reset-password/:token` - Reset password page

---

## 🔧 Setup Instructions

### Step 1: Configure Email Service

Add these variables to your `backend/.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=DoFlow Academy

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

### Step 2: Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings → Security
   - Under "Signing in to Google" → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` in .env

### Step 3: Alternative Email Services

#### **SendGrid**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### **Mailgun**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your_mailgun_smtp_password
```

#### **Amazon SES**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_smtp_username
EMAIL_PASSWORD=your_ses_smtp_password
```

---

## 🚀 Testing the Flow

### Test Email Verification

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Register a new account:**
   - Go to http://localhost:5173/#/auth
   - Click "Sign Up"
   - Enter name, email, password
   - Submit form

4. **Check your email:**
   - Look for email from "DoFlow Academy"
   - Click the verification link
   - You'll be redirected to success page

5. **Try to login before verifying:**
   - You'll get error: "Please verify your email"
   - Option to resend verification email

### Test Password Reset

1. **Go to login page**
2. **Click "Forgot Password?"**
3. **Enter your email**
4. **Check email for reset link**
5. **Click link and enter new password**
6. **Login with new password**

---

## 📁 Files Modified/Created

### Backend Files
- ✅ `backend/utils/emailService.js` - Email sending service with templates
- ✅ `backend/models/User.js` - Added verification token fields & methods
- ✅ `backend/controllers/authController.js` - Added 4 new endpoints
- ✅ `backend/routes/authRoutes.js` - Added verification & reset routes

### Frontend Files
- ✅ `pages/VerifyEmailPage.tsx` - Email verification page
- ✅ `pages/ResendVerificationPage.tsx` - Resend verification email
- ✅ `pages/ForgotPasswordPage.tsx` - Request password reset
- ✅ `pages/ResetPasswordPage.tsx` - Reset password form
- ✅ `pages/AuthPageNew.tsx` - Updated with forgot password link
- ✅ `App.tsx` - Added routes for new pages

---

### 🔐 Security Features

1. **Token Hashing:** All tokens are hashed using SHA-256 before storing in database
2. **Expiration:** 
   - Email verification token: 24 hours
   - Password reset token: 1 hour
3. **One-time use:** Tokens are cleared after use
4. **Password Requirements:** Minimum 6 characters (can be increased)
5. **Login Allowed:** Users can login regardless of email verification status
6. **Verification Tracking:** `isEmailVerified` field tracks verification status in database

---

## 📧 Email Templates

Three beautiful HTML email templates included:

1. **Verification Email**
   - Welcome message
   - Verification button
   - 24-hour expiration notice

2. **Password Reset Email**
   - Security warning
   - Reset button
   - 1-hour expiration notice

3. **Welcome Email** (sent after verification)
   - Platform features
   - Getting started guide
   - Support information

---

## 🐛 Troubleshooting

### Email Not Sending

**Check Console Logs:**
```
✅ Verification email sent to: user@example.com  // Success
⚠️ Email service not configured  // Missing env vars
❌ Error sending verification email  // SMTP error
```

**Common Issues:**

1. **Gmail "Less Secure Apps" Error**
   - Solution: Use App Password (see Step 2 above)

2. **SMTP Authentication Failed**
   - Check EMAIL_USER and EMAIL_PASSWORD are correct
   - Ensure no extra spaces in .env file

3. **Connection Timeout**
   - Check firewall/network settings
   - Try different EMAIL_PORT (465 for SSL)

4. **Email Goes to Spam**
   - Add SPF/DKIM records (for production)
   - Use professional SMTP service (SendGrid, Mailgun)

### Email Service Not Configured

If email service is not configured, the system will:
- Log a warning message
- Still create the user account
- Return success but with `emailSent: false`
- User won't receive email (for development testing)

---

## 🌐 API Endpoints

### New Endpoints Added:

```
POST   /api/auth/register              - Register (sends verification email)
POST   /api/auth/login                 - Login (checks email verification)
GET    /api/auth/verify-email/:token   - Verify email address
POST   /api/auth/resend-verification   - Resend verification email
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password/:token - Reset password
```

---

## 📊 Database Changes

### User Model - New Fields:

```javascript
{
  isEmailVerified: Boolean,              // Email verification status
  emailVerificationToken: String,        // Hashed token for verification
  emailVerificationExpire: Date,         // Token expiration time
  resetPasswordToken: String,            // Hashed token for password reset
  resetPasswordExpire: Date              // Token expiration time
}
```

---

## 🎨 Frontend Flow

```
REGISTRATION:
Register → Email Sent → Can Login Immediately (or verify email later)
         ↓
Check Inbox → Click Link → Verified (isEmailVerified = true)

PASSWORD RESET:
Login Page → Forgot Password → Enter Email → Check Inbox → 
Click Link → Enter New Password → Login
```

---

## 💡 Tips for Production

1. **Use Professional Email Service:**
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 1000 emails/month)
   - Amazon SES (cheap, scalable)

2. **Add Email Verification Badge:**
   - Show verified badge next to email in profile
   - Add "Verify Email" banner if not verified

3. **Rate Limiting:**
   - Limit verification email resends (max 3 per hour)
   - Limit password reset requests

4. **Email Deliverability:**
   - Configure SPF, DKIM, DMARC records
   - Use custom domain email
   - Warm up new email accounts gradually

5. **Monitoring:**
   - Track email delivery rates
   - Log failed email sends
   - Alert on SMTP errors

---

## 🎯 Next Steps

Optional Enhancements:
- [ ] Add email preferences (notifications on/off)
- [ ] Implement SMS verification as backup
- [ ] Add social login (Google, GitHub)
- [ ] Email templates for course enrollment
- [ ] Newsletter subscription system
- [ ] Admin panel to view email logs

---

## 🆘 Need Help?

If you encounter any issues:
1. Check console logs (both frontend & backend)
2. Verify .env variables are set correctly
3. Test email service with a simple script first
4. Check spam folder for test emails

---

## ✨ Success!

Your authentication system is now production-ready with:
- ✅ Email verification
- ✅ Password reset
- ✅ Beautiful email templates
- ✅ Secure token handling
- ✅ User-friendly error messages

Happy coding! 🚀
