import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import { FaBook, FaCertificate, FaChartLine, FaClock, FaHeart, FaTrophy } from 'react-icons/fa';
import { FiAward, FiDownload } from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificatesEarned: 0,
    totalHoursLearned: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/payment/enrollments');
      setEnrollments(response.data);
      
      // Calculate stats
      const completed = response.data.filter((e: any) => e.progress === 100).length;
      const inProgress = response.data.filter((e: any) => e.progress > 0 && e.progress < 100).length;
      
      // Get actual certificate count from backend
      try {
        const certResponse = await api.get('/certificates/my-certificates');
        setStats({
          totalCourses: response.data.length,
          completedCourses: completed,
          inProgressCourses: inProgress,
          certificatesEarned: certResponse.data.certificates.length,
          totalHoursLearned: Math.floor(response.data.reduce((acc: number, e: any) => acc + (e.course?.totalDuration || 0), 0) / 60)
        });
      } catch {
        setStats({
          totalCourses: response.data.length,
          completedCourses: completed,
          inProgressCourses: inProgress,
          certificatesEarned: 0,
          totalHoursLearned: Math.floor(response.data.reduce((acc: number, e: any) => acc + (e.course?.totalDuration || 0), 0) / 60)
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setIsLoading(false);
    }
  };

  const handleGetCertificate = async (courseId: string) => {
    try {
      const response = await api.post('/certificates/generate', { courseId });
      if (response.data.certificate) {
        alert('🎉 Certificate generated successfully!');
        window.location.hash = '/certificates';
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error generating certificate');
    }
  };

  const StatCard: React.FC<{ icon: any; title: string; value: string | number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 hover:border-brand-primary transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-full bg-${color}-500/20`}>
          <Icon className={`text-3xl text-${color}-400`} />
        </div>
        <div>
          <p className="text-light-textMuted dark:text-dark-muted text-sm">{title}</p>
          <p className="text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to access your dashboard</h2>
          <a href="/#/login" className="btn-primary">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-light-text dark:text-dark-text">Welcome back, {user.name}! 👋</h1>
          <p className="text-light-textSecondary dark:text-dark-muted">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard icon={FaBook} title="Total Courses" value={stats.totalCourses} color="blue" />
          <StatCard icon={FaChartLine} title="In Progress" value={stats.inProgressCourses} color="yellow" />
          <StatCard icon={FaTrophy} title="Completed" value={stats.completedCourses} color="green" />
          <StatCard icon={FaCertificate} title="Certificates" value={stats.certificatesEarned} color="purple" />
          <StatCard icon={FaClock} title="Hours Learned" value={stats.totalHoursLearned} color="cyan" />
        </div>

        {/* My Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">My Courses</h2>
            <a href="/#/courses" className="px-6 py-3 bg-light-card dark:bg-dark-card hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt text-light-text dark:text-dark-text font-semibold rounded-lg border-2 border-light-border dark:border-dark-border transition-all duration-200">Browse More Courses</a>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-gray-700 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-700 h-6 rounded mb-2"></div>
                  <div className="bg-gray-700 h-4 rounded"></div>
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-12 text-center">
              <FaBook className="text-6xl text-light-textMuted dark:text-dark-muted mx-auto mb-4" />
              <p className="text-light-textSecondary dark:text-dark-muted text-lg mb-4">You haven't enrolled in any courses yet</p>
              <a href="/#/courses" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200">Explore Courses</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment._id} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-lg transition-all duration-300 group">
                  <img
                    src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={enrollment.course?.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2 text-light-text dark:text-dark-text">{enrollment.course?.title}</h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-light-textMuted dark:text-dark-muted">Progress</span>
                        <span className="text-sm font-bold text-brand-primary">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-light-cardAlt dark:bg-dark-cardAlt rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-brand-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                    {enrollment.progress === 100 ? (
                      <>
                        <button
                          onClick={() => handleGetCertificate(enrollment.course?._id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                        >
                          <FiAward className="w-4 h-4" />
                          Get Certificate
                        </button>
                        <a
                          href={`/#/learn/${enrollment.course?._id}`}
                          className="px-4 py-2 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-lg hover:border-brand-primary transition-colors"
                          title="Review Course"
                        >
                          <FaBook />
                        </a>
                      </>
                    ) : (
                      <a
                        href={`/#/learn/${enrollment.course?._id}`}
                        className="flex-1 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold py-2 px-4 rounded-lg text-center transition-all duration-200"
                      >
                        {enrollment.progress === 0 ? 'Start Learning' : 'Continue'}
                      </a>
                    )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/#/wishlist" className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all duration-300 group">
            <FaHeart className="text-5xl text-red-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">My Wishlist</h3>
            <p className="text-light-textSecondary dark:text-dark-muted">Courses you want to take</p>
          </a>

          <a href="/#/certificates" className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all duration-300 group">
            <FaCertificate className="text-5xl text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">My Certificates</h3>
            <p className="text-light-textSecondary dark:text-dark-muted">View your achievements</p>
          </a>

          <a href="/#/profile" className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 text-center hover:border-brand-primary hover:shadow-lg transition-all duration-300 group">
            <FaChartLine className="text-5xl text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2 text-light-text dark:text-dark-text">Learning Analytics</h3>
            <p className="text-light-textSecondary dark:text-dark-muted">Track your progress</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
