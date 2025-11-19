import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, register } from '../src/store/slices/authSlice';
import { AppDispatch, RootState } from '../src/store';
import toast from '../src/utils/toast';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { Button, Input } from '../src/components/ui';

const AuthPageNew: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
        toast.success('Login successful! Welcome back!');
        window.location.hash = '/';
      } else {
        await dispatch(register(formData)).unwrap();
        toast.success('Registration successful! Welcome to DoFlow!');
        window.location.hash = '/';
      }
    } catch (err: any) {
      toast.error(err || 'Authentication failed. Please try again.');
    }
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
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-light-bg">
      {/* Auth Container */}
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-4 text-light-text">
                Welcome to <span className="text-brand-primary">DoFlow</span>
              </h1>
              <p className="text-lg text-light-textSecondary leading-relaxed">
                Join thousands of students mastering in-demand skills with our premium courses.
              </p>
            </div>
            
            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-light-textSecondary"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-light-card border border-light-border rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold text-brand-primary">{stat.value}</div>
                  <div className="text-sm text-light-textMuted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div>
          <div className="bg-light-card border border-light-border rounded-xl p-8 md:p-10 shadow-sm">
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8 p-1 bg-light-cardAlt rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 px-6 rounded-md font-medium transition-all ${
                  isLogin
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-light-textMuted hover:text-light-text'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 px-6 rounded-md font-medium transition-all ${
                  !isLogin
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-light-textMuted hover:text-light-text'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-light-text mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-light-textSecondary">
                {isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Start your journey to success today'}
              </p>
            </div>

            {/* Form */}
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
                  className="absolute right-4 top-[38px] text-light-textMuted hover:text-light-text transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-light-textSecondary cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-light-border accent-brand-primary" 
                    />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="text-brand-primary hover:text-brand-primaryHover transition-colors">
                    Forgot Password?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                icon={<FiArrowRight />}
                className="w-full"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-light-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-light-card text-light-textMuted">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Google', icon: '🔍', color: 'hover:border-brand-primary' },
                { name: 'GitHub', icon: '💻', color: 'hover:border-light-text' },
                { name: 'LinkedIn', icon: '💼', color: 'hover:border-brand-primary' }
              ].map((social) => (
                <button
                  key={social.name}
                  className={`p-3 bg-light-cardAlt border border-light-border rounded-lg hover:bg-light-card ${social.color} transition-all`}
                  title={social.name}
                >
                  <span className="text-2xl">{social.icon}</span>
                </button>
              ))}
            </div>

            {/* Toggle */}
            <p className="text-center text-light-textSecondary mt-8">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-primary hover:text-brand-primaryHover font-semibold transition-colors"
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
