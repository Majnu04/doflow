import User from '../models/User.js';
import PendingRegistration from '../models/PendingRegistration.js';
import { generateToken } from '../utils/jwt.js';
import { sendRegistrationOTP, sendPasswordResetOTP, sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// @desc    Resend OTP for existing registration
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    // Find existing pending registration
    const pendingReg = await PendingRegistration.findOne({ email });

    if (!pendingReg) {
      return res.status(404).json({ 
        success: false,
        message: 'No pending registration found. Please start registration again.' 
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update OTP and extend expiration
    pendingReg.otp = otp;
    pendingReg.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await pendingReg.save();

    // Resend OTP email
    const emailResult = await sendRegistrationOTP(email, pendingReg.name, otp);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'New OTP sent to your email.',
        email: email
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again later.',
        allowResend: true
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Send OTP for registration
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, and password' 
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Delete any existing pending registration for this email
    await PendingRegistration.deleteMany({ email });

    // Store pending registration with OTP (expires in 10 minutes)
    await PendingRegistration.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Send OTP email
    const emailResult = await sendRegistrationOTP(email, name, otp);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify within 10 minutes.',
        email: email
      });
    } else {
      // Keep registration alive for retry instead of deleting
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please use the resend button to try again.',
        email: email,
        allowResend: true
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Verify OTP and create user
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email and OTP' 
      });
    }

    // Find pending registration
    const pendingReg = await PendingRegistration.findOne({ 
      email,
      otpExpire: { $gt: Date.now() }
    });

    if (!pendingReg) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired or invalid. Please request a new one.' 
      });
    }

    // Verify OTP
    if (pendingReg.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP. Please try again.' 
      });
    }

    // OTP is valid - create the user
    const user = await User.create({
      name: pendingReg.name,
      email: pendingReg.email,
      password: pendingReg.password, // Already hashed
      isEmailVerified: true // Email verified via OTP
    });

    // Delete pending registration
    await PendingRegistration.deleteOne({ email });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Return user data and token
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to DoFlow Academy!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Register a new user (OLD - keeping for backward compatibility)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (not verified yet)
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: false
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        },
        emailSent: emailResult.success,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token and not expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification token' 
      });
    }

    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
      emailSent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Allow login but include verification status in response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses.course', 'title thumbnail price')
      .populate('wishlist', 'title thumbnail price discountPrice');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-reset-otp
// @access  Public
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide an email address' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with that email address' 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Delete any existing password reset OTP for this email
    await PendingRegistration.deleteMany({ email });

    // Store OTP in database with 10-minute expiration
    await PendingRegistration.create({
      name: user.name,
      email,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000
    });

    // Send OTP email
    const emailResult = await sendPasswordResetOTP(user.email, user.name, otp);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Password reset OTP sent to your email. Valid for 10 minutes.',
        email: email
      });
    } else {
      await PendingRegistration.deleteMany({ email });
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Verify OTP and reset password
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, OTP, and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Get stored OTP from database
    const pendingReset = await PendingRegistration.findOne({ email });

    if (!pendingReset) {
      return res.status(400).json({ 
        success: false,
        message: 'OTP expired or not found. Please request a new one.' 
      });
    }

    // Check expiry
    if (Date.now() > pendingReset.otpExpire) {
      await PendingRegistration.deleteMany({ email });
      return res.status(400).json({ 
        success: false,
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Verify OTP
    if (pendingReset.otp !== otp) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid OTP. Please try again.' 
      });
    }

    // OTP is valid - reset password
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP from database
    await PendingRegistration.deleteMany({ email });

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Forgot password - Send reset email (OLD - keeping for backward compatibility)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'No account found with that email address' 
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
      emailSent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Hash the token from URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
