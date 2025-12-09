import React, { useState } from 'react';
import { FiMail, FiCheckCircle, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../src/utils/api';
import { Button, Card, Input } from '../src/components/ui';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setShowOtpStep(true);
        toast.success('🔒 Password reset OTP sent to your email!');
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();
      
      if (data.success) {
        setResetSuccess(true);
        toast.success('🎉 Password reset successful!');
        setTimeout(() => {
          window.location.hash = '/auth';
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error('Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ New OTP sent!');
        setOtp('');
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleBackToEmail = () => {
    setShowOtpStep(false);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Success screen
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 pt-20 transition-colors duration-300">
        <div className="max-w-md w-full">
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
              Password Reset Successful! 🎉
            </h2>
            <p className="text-light-textSecondary dark:text-dark-muted mb-6 transition-colors duration-300">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <Button
              variant="primary"
              onClick={() => window.location.hash = '/auth'}
              className="w-full"
            >
              Go to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 pt-20 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => window.location.hash = '/auth'}
          className="flex items-center gap-2 text-light-textSecondary dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Login</span>
        </button>

        <Card className="p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
              <FiLock className="w-8 h-8 text-brand-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
              {showOtpStep ? 'Reset Your Password' : 'Forgot Password?'}
            </h2>
            <p className="text-light-textSecondary dark:text-dark-muted transition-colors duration-300">
              {showOtpStep 
                ? `Enter the OTP sent to ${email}` 
                : 'Enter your email to receive a password reset OTP'}
            </p>
          </div>

          {/* OTP and Password Reset Form */}
          {showOtpStep ? (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-light-border dark:border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300"
                  autoFocus
                />
                <p className="text-xs text-light-textMuted dark:text-dark-muted text-center mt-2">
                  OTP is valid for 10 minutes
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-light-text dark:text-dark-text transition-colors duration-300"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px] text-light-textMuted hover:text-light-text transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-light-text dark:text-dark-text transition-colors duration-300"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-light-textSecondary hover:text-brand-primary transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-brand-primary hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            /* Email Form */
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-light-text dark:text-dark-text mb-2 transition-colors duration-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-light-text dark:text-dark-text placeholder-light-textMuted dark:placeholder-dark-muted transition-colors duration-300"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
              </Button>
            </form>
          )}

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
            <p className="text-sm text-center text-light-textMuted dark:text-dark-muted transition-colors duration-300">
              Remember your password?{' '}
              <a href="/#/auth" className="text-brand-primary hover:underline font-medium">
                Sign in
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
