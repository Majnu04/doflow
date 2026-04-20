import React, { useState } from 'react';
import { FiCheckCircle, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import api from '../src/utils/api';
import { Button } from '../src/components/ui';
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

  const fieldClassName =
    'w-full px-4 py-3 bg-light-cardAlt border border-border-subtle rounded-xl shadow-sm focus:ring-4 focus:ring-brand-primary/15 focus:border-brand-primary text-light-text placeholder:text-light-textMuted transition-all duration-200';

  const fieldStyle: React.CSSProperties = {
    color: '#1F232E',
    WebkitTextFillColor: '#1F232E',
    caretColor: '#1F232E',
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/send-reset-otp', { email });
      if (data?.success) {
        setShowOtpStep(true);
        toast.success('🔒 Password reset OTP sent to your email!');
      } else {
        toast.error(data?.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP. Please try again.');
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
      const { data } = await api.post('/auth/verify-reset-otp', { email, otp, newPassword });
      if (data?.success) {
        setResetSuccess(true);
        toast.success('🎉 Password reset successful!');
        setTimeout(() => {
          window.location.hash = '/auth';
        }, 2000);
      } else {
        toast.error(data?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      const { data } = await api.post('/auth/send-reset-otp', { email });
      if (data?.success) {
        toast.success('✅ New OTP sent!');
        setOtp('');
      } else {
        toast.error(data?.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resend OTP');
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
      <div className="min-h-[calc(100vh-80px)] bg-light-bg pt-24 md:pt-28 pb-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-light-card border border-border-subtle rounded-3xl p-8 md:p-10 shadow-[0_24px_60px_rgba(32,29,25,0.12)] text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-5">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-3xl font-display font-bold text-light-text mb-3">
              Password Updated Successfully
            </h2>
            <p className="text-light-textSecondary mb-7 leading-relaxed">
              Your account is secure again. Use your new password to sign in and continue learning.
            </p>

            <Button
              variant="primary"
              onClick={() => window.location.hash = '/auth'}
              className="w-full"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-light-bg pt-24 md:pt-28 pb-12 px-4 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-primary/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-brand-accent/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.08fr] gap-8 items-start">
        <section className="hidden lg:block pt-8 pr-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-subtle bg-white/80 text-brand-primary text-sm font-semibold mb-6">
            Account Recovery
          </div>
          <h1 className="text-5xl font-display font-bold text-light-text leading-[1.05] mb-4">
            Get back into your account quickly
          </h1>
          <p className="text-lg text-light-textSecondary leading-relaxed mb-8 max-w-xl">
            We will send a one-time verification code to your email. Use it to set a new password and continue your learning journey securely.
          </p>
          <div className="space-y-3 text-light-textSecondary">
            <p>1. Enter your registered email.</p>
            <p>2. Verify the 6-digit OTP.</p>
            <p>3. Set a strong new password.</p>
          </div>
        </section>

        <section className="max-w-xl w-full mx-auto lg:mx-0">
          <button
            onClick={() => window.location.hash = '/auth'}
            className="inline-flex items-center gap-2 text-light-textSecondary hover:text-light-text mb-5 transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Login</span>
          </button>

          <div className="bg-light-card border border-border-subtle rounded-3xl p-6 md:p-8 shadow-[0_24px_60px_rgba(32,29,25,0.12)]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/12 rounded-2xl mb-4">
                <FiLock className="w-8 h-8 text-brand-primary" />
              </div>

              <h2 className="text-3xl font-display font-bold text-light-text mb-2">
                {showOtpStep ? 'Reset your password' : 'Forgot your password?'}
              </h2>
              <p className="text-light-textSecondary leading-relaxed">
                {showOtpStep
                  ? `We sent a 6-digit OTP to ${email}. Enter it below to continue.`
                  : 'Enter your email and we will send a one-time reset code.'}
              </p>
            </div>

            {showOtpStep ? (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-light-text mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className={`${fieldClassName} text-center text-2xl font-bold tracking-[0.35em]`}
                    style={fieldStyle}
                    autoFocus
                  />
                  <p className="text-xs text-light-textMuted text-center mt-2">
                    OTP expires in 10 minutes
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-light-text mb-2">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={fieldClassName}
                    style={fieldStyle}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[41px] text-light-textMuted hover:text-light-text transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-light-text mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={fieldClassName}
                    style={fieldStyle}
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? 'Resetting Password...' : 'Update Password'}
                </Button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-light-textSecondary hover:text-brand-primary transition-colors"
                  >
                    Change email
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
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-light-text mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={fieldClassName}
                    style={fieldStyle}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Send Reset OTP'}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-border-subtle">
              <p className="text-sm text-center text-light-textMuted">
                Remember your password?{' '}
                <a href="/#/auth" className="text-brand-primary hover:underline font-semibold">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
