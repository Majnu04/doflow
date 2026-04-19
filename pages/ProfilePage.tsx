import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { updateProfile } from '../src/store/slices/authSlice';
import { getStudentDashboardData } from '../src/store/slices/dashboardSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiCamera, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { Button, Input, Card } from '../src/components/ui';
import api from '../src/utils/api';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const { stats } = useSelector((state: RootState) => state.dashboard);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    if (!user || isEditing) return;

    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      avatar: user.avatar || ''
    });
  }, [user, isEditing]);

  useEffect(() => {
    if (user) {
      dispatch(getStudentDashboardData());
    }
  }, [dispatch, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promise = dispatch(updateProfile(formData)).unwrap();
    toast.promise(promise, {
      loading: 'Updating profile...',
      success: 'Profile updated successfully!',
      error: (err) => err.message || 'Failed to update profile',
    });
    promise.then(() => setIsEditing(false));
  };

  const handleSendPasswordOTP = async () => {
    if (!user?.email) {
      toast.error('Email not found');
      return;
    }

    setPasswordLoading(true);
    const promise = api.post('/auth/send-reset-otp', { email: user.email }).then((res) => res.data);

    toast.promise(promise, {
      loading: 'Sending OTP...',
      success: (data) => {
        if (data.success) {
          setShowOtpStep(true);
          return '🔒 Password reset OTP sent to your email!';
        }
        throw new Error(data.message || 'Failed to send OTP');
      },
      error: (err) => err.message || 'Failed to send OTP. Please try again.',
    }).finally(() => {
      setPasswordLoading(false);
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.otp || passwordData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setPasswordLoading(true);
    const promise = api
      .post('/auth/verify-reset-otp', {
        email: user?.email,
        otp: passwordData.otp,
        newPassword: passwordData.newPassword,
      })
      .then((res) => res.data);

    toast.promise(promise, {
      loading: 'Changing password...',
      success: (data) => {
        if (data.success) {
          closePasswordModal();
          return '🎉 Password changed successfully!';
        }
        throw new Error(data.message || 'Failed to change password');
      },
      error: (err) => err.message || 'Password change failed. Please try again.',
    }).finally(() => {
      setPasswordLoading(false);
    });
  };

  const handleResendOTP = async () => {
    await handleSendPasswordOTP();
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setShowOtpStep(false);
    setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
            <Button
              variant="primary"
              onClick={() => window.location.hash = '/auth'}
            >
              Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-light-bg relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-hero-gradient opacity-55" />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-medium mb-4">
            <FiUser className="w-4 h-4" />
            Account Center
          </div>
          <h1 className="text-4xl font-display font-bold text-light-text mb-2">
            My Profile
          </h1>
          <p className="text-light-textSecondary">Manage your account information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card variant="glass" className="lg:col-span-1 p-6 text-center h-fit border-brand-primary/15">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-brand-primary to-brand-accent flex items-center justify-center text-white text-4xl font-bold mx-auto shadow-lg shadow-brand-primary/20">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-brand-primary rounded-full shadow-md hover:scale-110 transition-transform">
                <FiCamera className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-light-text mb-1">{user.name}</h2>
            <p className="text-light-textSecondary text-sm mb-4">{user.email}</p>
            
            <div className="inline-flex px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-full text-brand-primary text-sm font-semibold mb-4">
              {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
              {/* {console.log(user.role)} */}
            </div>

            <div className="space-y-3 text-sm text-light-textSecondary">
              <div className="flex items-center justify-center gap-2">
                <FiMail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center justify-center gap-2">
                  <FiPhone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Profile Form */}
          <Card variant="glass" className="lg:col-span-2 p-8 border-brand-primary/15">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-light-text">Profile Information</h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  icon={<FiEdit2 />}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      bio: user?.bio || '',
                      avatar: user?.avatar || ''
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-light-textMuted mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  icon={<FiUser className="w-5 h-5" />}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-light-cardAlt text-light-text' : ''}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-textMuted mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  icon={<FiMail className="w-5 h-5" />}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-light-cardAlt text-light-text' : ''}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-textMuted mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  icon={<FiPhone className="w-5 h-5" />}
                  readOnly={!isEditing}
                  className={!isEditing ? 'bg-light-cardAlt text-light-text' : ''}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-textMuted mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3 border border-border-subtle rounded-2xl text-light-text placeholder-light-textMuted/70 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/18 transition-all duration-300 ${!isEditing ? 'bg-light-cardAlt' : 'bg-white/90'}`}
                />
              </div>

              {isEditing && (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  icon={<FiSave />}
                  className="w-full"
                >
                  Save Changes
                </Button>
              )}
            </form>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card variant="glass" className="p-6 border-brand-primary/15">
            <h3 className="text-xl font-bold text-light-text mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-light-textSecondary">Enrolled Courses</span>
                <span className="font-bold text-light-text">{stats.totalCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-textSecondary">Completed Courses</span>
                <span className="font-bold text-light-text">{stats.completedCourses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-textSecondary">Certificates Earned</span>
                <span className="font-bold text-light-text">{stats.certificatesEarned}</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6 border-brand-primary/15">
            <h3 className="text-xl font-bold text-light-text mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left py-2 text-light-textSecondary hover:text-brand-primary transition-colors flex items-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                Change Password
              </button>
              <button className="w-full text-left py-2 text-light-textSecondary hover:text-brand-primary transition-colors">
                Email Preferences
              </button>
              <button className="w-full text-left py-2 text-red-500 hover:text-red-600 transition-colors">
                Delete Account
              </button>
            </div>
          </Card>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card variant="glass" className="max-w-md w-full p-8 relative border-brand-primary/20">
              <button
                onClick={closePasswordModal}
                className="absolute top-4 right-4 text-light-textMuted hover:text-light-text transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/12 rounded-full mb-4">
                  <FiLock className="w-8 h-8 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold text-light-text mb-2">
                  {showOtpStep ? 'Enter OTP & New Password' : 'Change Password'}
                </h2>
                <p className="text-light-textSecondary">
                  {showOtpStep 
                    ? `Enter the OTP sent to ${user?.email}` 
                    : 'We\'ll send an OTP to your email to verify it\'s you'}
                </p>
              </div>

              {!showOtpStep ? (
                /* Step 1: Send OTP */
                <div className="space-y-4">
                  <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4">
                    <p className="text-sm text-light-text">
                      <strong>📧 Email:</strong> {user?.email}
                    </p>
                    <p className="text-xs text-light-textSecondary mt-2">
                      An OTP will be sent to this email address
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleSendPasswordOTP}
                    disabled={passwordLoading}
                    isLoading={passwordLoading}
                  >
                    {passwordLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>

                  <button
                    onClick={closePasswordModal}
                    className="w-full text-center text-light-textMuted hover:text-light-text text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                /* Step 2: Enter OTP and New Password */
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-light-textMuted mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={passwordData.otp}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        otp: e.target.value.replace(/\D/g, '').slice(0, 6)
                      })}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest bg-white/90 border border-border-subtle rounded-2xl text-light-text focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/18"
                      autoFocus
                    />
                    <p className="text-xs text-light-textSecondary text-center mt-2">
                      OTP is valid for 10 minutes
                    </p>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-light-textMuted mb-2">
                      New Password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      placeholder="Enter new password"
                      icon={<FiLock className="w-5 h-5" />}
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
                    <label className="block text-sm font-medium text-light-textMuted mb-2">
                      Confirm Password
                    </label>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      placeholder="Confirm new password"
                      icon={<FiLock className="w-5 h-5" />}
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={passwordLoading || passwordData.otp.length !== 6}
                    isLoading={passwordLoading}
                  >
                    {passwordLoading ? 'Changing Password...' : 'Change Password'}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpStep(false);
                        setPasswordData({ otp: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="text-light-textMuted hover:text-light-text transition-colors"
                    >
                      ← Back
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
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
