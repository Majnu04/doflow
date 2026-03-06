# OTP Endpoints - Frontend Integration Map 🗺️

## Overview
This document shows where each OTP endpoint is used in the frontend.

---

## 📍 Backend Endpoints

### Registration Endpoints:
1. `POST /api/auth/send-otp` - Send registration OTP
2. `POST /api/auth/verify-otp` - Verify OTP and create user

### Password Reset Endpoints:
3. `POST /api/auth/send-reset-otp` - Send password reset OTP
4. `POST /api/auth/verify-reset-otp` - Verify OTP and reset password

---

## 🔗 Frontend Integration

### 1️⃣ Registration with OTP
**Endpoints Used:**
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

**Frontend File:** `pages/AuthPageNew.tsx`

**User Flow:**
1. User visits: `http://localhost:5173/#/auth`
2. Clicks "Sign Up" tab
3. Fills Name, Email, Password
4. Clicks "Send OTP" button → Calls `/api/auth/send-otp`
5. Enters 6-digit OTP
6. Clicks "Verify & Register" → Calls `/api/auth/verify-otp`
7. Account created + Auto login

**Code Locations:**
- **Line 44-62**: `handleSendOTP()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  ```

- **Line 64-107**: `handleVerifyOTP()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: formData.email, otp })
  });
  ```

- **Line 121-145**: `handleResendOTP()` function (resends registration OTP)

---

### 2️⃣ Forgot Password (External - Not Logged In)
**Endpoints Used:**
- `POST /api/auth/send-reset-otp`
- `POST /api/auth/verify-reset-otp`

**Frontend File:** `pages/ForgotPasswordPage.tsx`

**User Flow:**
1. User visits: `http://localhost:5173/#/auth`
2. Clicks "Forgot Password?" link
3. Redirected to: `http://localhost:5173/#/forgot-password`
4. Enters email
5. Clicks "Send Reset OTP" → Calls `/api/auth/send-reset-otp`
6. Enters OTP + New Password + Confirm Password
7. Clicks "Reset Password" → Calls `/api/auth/verify-reset-otp`
8. Password updated + Redirect to login

**Code Locations:**
- **Line 19-46**: `handleSendOTP()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  ```

- **Line 48-92**: `handleVerifyAndReset()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword })
  });
  ```

- **Line 94-112**: `handleResendOTP()` function (resends password reset OTP)

---

### 3️⃣ Change Password (Internal - Logged In User) ✨ NEW!
**Endpoints Used:**
- `POST /api/auth/send-reset-otp`
- `POST /api/auth/verify-reset-otp`

**Frontend File:** `pages/ProfilePage.tsx`

**User Flow:**
1. User logs in and visits profile: `http://localhost:5173/#/profile`
2. Scrolls to "Account Settings" section
3. Clicks "Change Password" button
4. Modal opens showing current email
5. Clicks "Send OTP" → Calls `/api/auth/send-reset-otp` (using logged-in user's email)
6. Enters OTP + New Password + Confirm Password
7. Clicks "Change Password" → Calls `/api/auth/verify-reset-otp`
8. Password updated + Modal closes

**Code Locations:**
- **Line 52-78**: `handleSendPasswordOTP()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email })  // Uses logged-in user's email
  });
  ```

- **Line 80-126**: `handleChangePassword()` function
  ```typescript
  const response = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user?.email,
      otp: passwordData.otp,
      newPassword: passwordData.newPassword
    })
  });
  ```

- **Line 128-130**: `handleResendOTP()` function (resends password reset OTP)

- **Line 268-410**: Password Change Modal UI (full modal implementation)

---

## 📊 Endpoint Usage Summary

| Endpoint | Used In | Purpose | User State |
|----------|---------|---------|------------|
| `/api/auth/send-otp` | `AuthPageNew.tsx` | Send registration OTP | Not logged in |
| `/api/auth/verify-otp` | `AuthPageNew.tsx` | Verify & create account | Not logged in |
| `/api/auth/send-reset-otp` | `ForgotPasswordPage.tsx` | Send reset OTP (forgot password) | Not logged in |
| `/api/auth/send-reset-otp` | `ProfilePage.tsx` | Send reset OTP (change password) | **Logged in** ✨ |
| `/api/auth/verify-reset-otp` | `ForgotPasswordPage.tsx` | Reset password (forgot) | Not logged in |
| `/api/auth/verify-reset-otp` | `ProfilePage.tsx` | Change password (profile) | **Logged in** ✨ |

---

## 🎯 Key Differences

### Forgot Password vs Change Password

| Feature | Forgot Password | Change Password |
|---------|----------------|-----------------|
| **Page** | `ForgotPasswordPage.tsx` | `ProfilePage.tsx` |
| **Route** | `/#/forgot-password` | `/#/profile` |
| **User State** | Not logged in | Logged in |
| **Email Source** | User enters email | From logged-in user object |
| **Access** | Public link on login page | Protected - requires authentication |
| **UI** | Full page | Modal popup |
| **Use Case** | User forgot password | User wants to change password |

---

## 🔒 Security Features

### All Password Reset Flows Include:
- ✅ 6-digit OTP verification
- ✅ 10-minute OTP expiry
- ✅ Email delivery confirmation
- ✅ Password length validation (min 6 chars)
- ✅ Password confirmation matching
- ✅ Resend OTP option
- ✅ Clear error messages
- ✅ Loading states
- ✅ Success feedback

---

## 🎨 UI Components

### Registration OTP (AuthPageNew.tsx)
- Tab switcher (Login/Sign Up)
- Step 1: Name, Email, Password fields
- Step 2: OTP input (6-digit, centered, large text)
- "Back to form" and "Resend OTP" buttons
- Auto-login after verification

### Forgot Password (ForgotPasswordPage.tsx)
- Step 1: Email input field
- Step 2: OTP input + New Password + Confirm Password
- Password visibility toggle
- "Change email" and "Resend OTP" buttons
- Success screen with countdown redirect

### Change Password Modal (ProfilePage.tsx) ✨ NEW!
- Glassmorphism modal overlay
- Close button (X)
- Step 1: Email confirmation + "Send OTP" button
- Step 2: OTP input + New Password + Confirm Password
- Password visibility toggle
- "Back" and "Resend OTP" buttons
- Modal auto-closes on success

---

## 🧪 Testing Guide

### Test Registration:
1. Navigate to: `http://localhost:5173/#/auth`
2. Fill signup form
3. Click "Send OTP"
4. Check email for OTP
5. Enter OTP and verify

### Test Forgot Password:
1. Navigate to: `http://localhost:5173/#/auth`
2. Click "Forgot Password?"
3. Enter email
4. Click "Send Reset OTP"
5. Check email for OTP
6. Enter OTP + new password
7. Try logging in with new password

### Test Change Password (Profile): ✨
1. **Login first** at: `http://localhost:5173/#/auth`
2. Navigate to: `http://localhost:5173/#/profile`
3. Scroll to "Account Settings"
4. Click "Change Password"
5. Modal opens - Click "Send OTP"
6. Check email for OTP
7. Enter OTP + new password + confirm
8. Click "Change Password"
9. Modal closes on success
10. **Logout and login with new password to verify**

---

## 🚀 All Routes

### Frontend Routes:
- `/#/auth` - Login/Registration page (with OTP)
- `/#/forgot-password` - Forgot password page (with OTP)
- `/#/profile` - User profile page (with change password modal)

### Backend API Routes:
- `POST /api/auth/send-otp` - Registration OTP
- `POST /api/auth/verify-otp` - Verify registration OTP
- `POST /api/auth/send-reset-otp` - Password reset OTP
- `POST /api/auth/verify-reset-otp` - Verify reset OTP
- `POST /api/auth/login` - Login (no OTP needed)

---

## ✅ Implementation Complete!

All OTP endpoints are now connected to the frontend:
- ✅ Registration with OTP - `AuthPageNew.tsx`
- ✅ Forgot Password with OTP - `ForgotPasswordPage.tsx`
- ✅ Change Password with OTP - `ProfilePage.tsx` ✨ **NEW!**

**No more missing password change functionality!** 🎉

---

## 📦 Files Modified

### Backend:
- `backend/controllers/authController.js` - All OTP logic
- `backend/routes/authRoutes.js` - 4 new routes
- `backend/utils/emailService.js` - 2 OTP email templates
- `backend/models/PendingRegistration.js` - Temp registration storage

### Frontend:
- `pages/AuthPageNew.tsx` - Registration OTP flow
- `pages/ForgotPasswordPage.tsx` - Forgot password OTP flow
- `pages/ProfilePage.tsx` - Change password modal with OTP ✨ **NEW!**

---

**Ready to test all three flows!** 🚀
