import express from 'express';
import { 
  sendOTP,
  resendOTP,
  verifyOTP,
  sendResetOTP,
  verifyResetOTP,
  register, 
  login, 
  getMe, 
  updateProfile,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// New OTP-based registration
router.post('/send-otp', sendOTP);
router.post('/resend-otp', resendOTP);
router.post('/verify-otp', verifyOTP);

// New OTP-based password reset
router.post('/send-reset-otp', sendResetOTP);
router.post('/verify-reset-otp', verifyResetOTP);

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
