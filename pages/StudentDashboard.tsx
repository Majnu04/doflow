import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import { FaBook, FaCertificate, FaChartLine, FaClock, FaHeart, FaTrophy } from 'react-icons/fa';

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
      const certificates = response.data.filter((e: any) => e.certificateIssued).length;
      
      setStats({
        totalCourses: response.data.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        certificatesEarned: certificates,
        totalHoursLearned: Math.floor(response.data.reduce((acc: number, e: any) => acc + (e.course?.totalDuration || 0), 0) / 60)
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{ icon: any; title: string; value: string | number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-full bg-${color}-500 bg-opacity-20`}>
          <Icon className={`text-3xl text-${color}-400`} />
        </div>
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
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
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-400">Continue your learning journey</p>
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
            <h2 className="text-3xl font-bold">My Courses</h2>
            <a href="/#/courses" className="btn-secondary">Browse More Courses</a>
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
            <div className="card text-center py-12">
              <FaBook className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">You haven't enrolled in any courses yet</p>
              <a href="/#/courses" className="btn-primary">Explore Courses</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <div key={enrollment._id} className="card hover:scale-105 transform transition-all duration-300">
                  <img
                    src={enrollment.course?.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={enrollment.course?.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  <h3 className="text-xl font-bold mb-2 line-clamp-2">{enrollment.course?.title}</h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-bold text-brand-primary">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-brand-primary to-brand-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`/#/learn/${enrollment.course?._id}`}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      {enrollment.progress === 0 ? 'Start Learning' : 'Continue'}
                    </a>
                    {enrollment.certificateIssued && (
                      <button className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700">
                        <FaCertificate />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="/#/wishlist" className="card text-center hover:scale-105 transform transition-all">
            <FaHeart className="text-5xl text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">My Wishlist</h3>
            <p className="text-gray-400">Courses you want to take</p>
          </a>

          <a href="/#/certificates" className="card text-center hover:scale-105 transform transition-all">
            <FaCertificate className="text-5xl text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">My Certificates</h3>
            <p className="text-gray-400">View your achievements</p>
          </a>

          <a href="/#/profile" className="card text-center hover:scale-105 transform transition-all">
            <FaChartLine className="text-5xl text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Learning Analytics</h3>
            <p className="text-gray-400">Track your progress</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
