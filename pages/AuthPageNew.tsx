import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../src/store/slices/authSlice';
import { AppDispatch, RootState } from '../src/store';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { Button, Input } from '../src/components/ui';

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');

const AuthPageNew: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ OTP sent to your email!');
        setShowOtpStep(true);
      } else {
        toast.error(data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      toast.error('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('🎉 Registration successful! Welcome to DoFlow!');
        
        // Store token and user data
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Redirect to home
        setTimeout(() => {
          window.location.hash = '/';
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      toast.error('Verification failed. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const result = await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
        toast.success('Login successful! Welcome back!');
        
        // Show verification reminder if email not verified
        if (!result.isEmailVerified) {
          setTimeout(() => {
            toast('📧 Reminder: Please verify your email for full account access.');
          }, 1500);
        }
        
        window.location.hash = '/';
      } else {
        // Signup with OTP - call handleSendOTP instead
        await handleSendOTP(e);
      }
    } catch (err: any) {
      toast.error(err || 'Authentication failed. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('✅ New OTP sent!');
        setOtp(''); // Clear previous OTP
      } else {
        toast.error(data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleBackToForm = () => {
    setShowOtpStep(false);
    setOtp('');
  };

  const features = [
    { icon: <FiCheck className="w-5 h-5" />, text: 'Learn from Industry Experts' },
    { icon: <FiCheck className="w-5 h-5" />, text: 'Access 500+ HD Video Courses' },
    { icon: <FiCheck className="w-5 h-5" />, text: 'Study at Your Own Pace' },
    { icon: <FiCheck className="w-5 h-5" />, text: 'Earn Recognized Certificates' }
  ];

  const stats = [
    { value: '50K+', label: 'Students' },
    { value: '500+', label: 'Courses' },
    { value: '100+', label: 'Instructors' }
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-light-bg px-4 pb-10 pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-72 w-72 rounded-full bg-brand-primary/20 blur-3xl" />
        <div className="absolute -right-20 top-28 h-80 w-80 rounded-full bg-brand-accent/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.12] grid-background" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-start gap-10 md:grid-cols-2 lg:gap-14">
        {/* Left Side - Premium Brand Story */}
        <div className="hidden md:block">
          <div className="space-y-7">
            <span className="pill animate-soft-fade">Curated Premium Learning</span>
            <div className="space-y-4">
              <h1 className="heading-hero font-display font-bold text-light-text text-shadow-sm">
                Build your next skill chapter with{' '}
                <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                  DoFlow
                </span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-light-textSecondary">
                Learn through structured roadmaps, industry-ready projects, and step-by-step guidance designed for serious growth.
              </p>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="animate-rise-up flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-light-textSecondary shadow-sm backdrop-blur-md"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary/12 text-brand-primary">
                    {feature.icon}
                  </div>
                  <span className="font-medium text-light-textSecondary">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/70 bg-white/80 p-4 text-center shadow-sm backdrop-blur-md"
                >
                  <div className="text-2xl font-bold text-brand-primary">{stat.value}</div>
                  <div className="text-sm text-light-textMuted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Premium Auth Card */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-brand-primary/35 to-brand-accent/35 blur-2xl" />
          <div className="relative glass-panel rounded-[1.75rem] border border-white/70 p-6 shadow-xl md:p-8 animate-scale-in">
            <div className="mb-6 flex gap-2 rounded-xl bg-light-cardAlt/90 p-1.5">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-lg py-2.5 px-6 font-semibold transition-all duration-300 ${
                  isLogin
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'text-light-textMuted hover:text-light-text'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-lg py-2.5 px-6 font-semibold transition-all duration-300 ${
                  !isLogin
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'text-light-textMuted hover:text-light-text'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-display font-bold text-light-text">
                {isLogin ? 'Welcome Back!' : (showOtpStep ? 'Verify OTP' : 'Create Account')}
              </h2>
              <p className="text-light-textSecondary">
                {isLogin
                  ? 'Sign in to continue your learning journey'
                  : (showOtpStep
                      ? `Enter the 6-digit OTP sent to ${formData.email}`
                      : 'Start your journey to success today')}
              </p>
            </div>

            {!isLogin && showOtpStep ? (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-light-text">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full rounded-xl border border-light-border bg-light-bg px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] text-light-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    autoFocus
                  />
                  <p className="text-center text-xs text-light-textMuted">OTP is valid for 10 minutes</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full rounded-xl"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Register'}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleBackToForm}
                    className="text-light-textSecondary transition-colors hover:text-brand-primary"
                  >
                    Back to form
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    icon={<FiUser className="w-5 h-5" />}
                    label="Full Name"
                    required
                  />
                )}

                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  icon={<FiMail className="w-5 h-5" />}
                  label="Email Address"
                  required
                />

                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    icon={<FiLock className="w-5 h-5" />}
                    label="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[38px] text-light-textMuted transition-colors hover:text-light-text"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-light-textSecondary">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-light-border accent-brand-primary"
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="/#/forgot-password" className="text-brand-primary transition-colors hover:text-brand-primaryHover">
                      Forgot Password?
                    </a>
                  </div>
                )}

                {!isLogin && (
                  <div className="rounded-lg border border-brand-primary/15 bg-brand-primary/5 p-3 text-xs text-light-textMuted">
                    By signing up, you agree to receive a verification email to complete your registration.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={<FiArrowRight />}
                  className="w-full rounded-xl shadow-md shadow-brand-primary/20"
                >
                  {isLogin ? 'Sign In' : 'Send OTP'}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-light-textSecondary">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-brand-primary transition-colors hover:text-brand-primaryHover"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageNew;
