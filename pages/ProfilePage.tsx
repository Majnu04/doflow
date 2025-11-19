import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { updateProfile } from '../src/store/slices/authSlice';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiCamera } from 'react-icons/fi';
import { Button, Input, Card } from '../src/components/ui';
import toast from '../src/utils/toast';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    }
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
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            My Profile
          </h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card variant="glass" className="lg:col-span-1 p-6 text-center h-fit">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-elite-purple to-elite-blue flex items-center justify-center text-white text-4xl font-bold mx-auto">
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
              <button className="absolute bottom-0 right-0 p-2 bg-elite-purple rounded-full shadow-neon hover:scale-110 transition-transform">
                <FiCamera className="w-4 h-4 text-white" />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="inline-flex px-3 py-1 bg-elite-gold/20 border border-elite-gold/30 rounded-full text-elite-gold text-sm font-semibold mb-4">
              {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
            </div>

            <div className="space-y-3 text-sm text-gray-400">
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
          <Card variant="glass" className="lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Profile Information</h3>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  icon={<FiUser className="w-5 h-5" />}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  icon={<FiMail className="w-5 h-5" />}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  icon={<FiPhone className="w-5 h-5" />}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-elite-purple focus:ring-2 focus:ring-elite-purple/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Enrolled Courses</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed Courses</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Certificates Earned</span>
                <span className="font-bold">0</span>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-bold mb-4">Account Settings</h3>
            <div className="space-y-3">
              <button className="w-full text-left py-2 text-gray-300 hover:text-white transition-colors">
                Change Password
              </button>
              <button className="w-full text-left py-2 text-gray-300 hover:text-white transition-colors">
                Email Preferences
              </button>
              <button className="w-full text-left py-2 text-red-400 hover:text-red-300 transition-colors">
                Delete Account
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
