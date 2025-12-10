import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getStudentDashboardData } from '../src/store/slices/dashboardSlice';
import { CourseGridSkeleton, EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { FaBook, FaCertificate, FaChartLine, FaClock, FaHeart, FaTrophy } from 'react-icons/fa';
import { isDsaCourse } from '../src/utils/courseUtils';

const StudentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enrollments, stats, status, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    if (user) {
      dispatch(getStudentDashboardData());
    }
  }, [dispatch, user]);

  const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; accent: string }> = ({ icon: Icon, title, value, accent }) => (
    <div className="bg-light-card border border-border-subtle rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-brand-primary/70">
      <div className={`p-3 rounded-lg ${accent}`}>
        <Icon className="text-xl" />
      </div>
      <div>
        <p className="text-light-textMuted text-xs uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-light-text">{value}</p>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4 text-light-text">Please login to access your dashboard</h2>
          <a href="#/auth" className="inline-block bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-primaryHover transition">
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-light-textSecondary">Let's continue your learning journey.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-10">
          <StatCard icon={FaBook} title="Enrolled Courses" value={stats.totalCourses} accent="bg-sky-50 text-sky-600" />
          <StatCard icon={FaChartLine} title="In Progress" value={stats.inProgressCourses} accent="bg-amber-50 text-amber-600" />
          <StatCard icon={FaTrophy} title="Completed" value={stats.completedCourses} accent="bg-emerald-50 text-emerald-600" />
          <StatCard icon={FaCertificate} title="Certificates" value={stats.certificatesEarned} accent="bg-violet-50 text-violet-600" />
          <StatCard icon={FaClock} title="Hours Learned" value={stats.totalHoursLearned} accent="bg-cyan-50 text-cyan-600" />
        </div>

        {/* My Courses */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-3xl font-bold">My Courses</h2>
            <a href="#/courses" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-light-card hover:bg-light-cardAlt text-light-text font-medium rounded-lg border border-border-subtle transition-all duration-300">
              Browse More
            </a>
          </div>

          {status === 'loading' || status === 'idle' ? (
            <CourseGridSkeleton count={3} />
          ) : status === 'failed' ? (
            <ErrorState message={error || "Couldn't load your courses."} onRetry={() => dispatch(getStudentDashboardData())} />
          ) : enrollments.length === 0 ? (
            <EmptyState
              icon={<FaBook className="w-16 h-16 text-brand-primary" />}
              title="No Courses Yet"
              message="You haven't enrolled in any courses. Time to start learning!"
              action={
                <a href="#/courses" className="inline-block bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-primaryHover transition">
                  Explore Courses
                </a>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map(enrollment => {
                const course = enrollment.course;
                const isDsa = isDsaCourse(course);
                const courseLink = isDsa
                  ? `#/dsa/problems/${course?._id}`
                  : `#/learn/${course?._id}`;

                return (
                <a 
                  key={enrollment._id} 
                  href={courseLink}
                  className="bg-light-card border border-border-subtle rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-md transition-all group text-left"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course?.thumbnail || 'https://placehold.co/600x400/1a1a2e/ffffff?text=Course'}
                      alt={course?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-light-text mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {course?.title}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-light-textMuted">Progress</span>
                        <span className="font-bold text-brand-primary">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-light-cardAlt rounded-full h-2.5">
                        <div
                          className="bg-brand-primary h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                        <span className="text-sm font-medium text-light-text">
                         {isDsa ? 'Open Problem Workspace' : enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                       </span>
                       {enrollment.certificateIssued && (
                        <div className="flex items-center gap-1 text-green-500">
                          <FaCertificate className="w-4 h-4" />
                          <span className="text-xs font-semibold">Certificate</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              )})}
            </div>
          )}
        </div>

        {/* Learning Analytics Section */}
        {enrollments.length > 0 && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-5">Learning Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Progress Overview */}
              <div className="bg-light-card border border-border-subtle rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-brand-primary" />
                  Progress Overview
                </h3>
                <div className="space-y-4">
                  {enrollments.slice(0, 5).map(enrollment => {
                    const course = enrollment.course;
                    return (
                      <div key={enrollment._id}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-light-text truncate max-w-[70%]">
                            {course?.title || 'Course'}
                          </span>
                          <span className="text-sm font-semibold text-brand-primary">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-primaryHover rounded-full transition-all duration-500"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Learning Stats */}
              <div className="bg-light-card border border-border-subtle rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaTrophy className="text-brand-primary" />
                  Learning Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-neutral-sand rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-accentSoft rounded-lg">
                        <FaBook className="text-brand-primary" />
                      </div>
                      <span className="font-medium text-light-text">Total Enrollments</span>
                    </div>
                    <span className="text-xl font-bold text-brand-primary">{stats.totalCourses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-sand rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-accentSoft rounded-lg">
                        <FaClock className="text-brand-accent" />
                      </div>
                      <span className="font-medium text-light-text">Active Courses</span>
                    </div>
                    <span className="text-xl font-bold text-brand-accent">{stats.inProgressCourses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-sand rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-accentSoft rounded-lg">
                        <FaTrophy className="text-brand-primaryHover" />
                      </div>
                      <span className="font-medium text-light-text">Completed</span>
                    </div>
                    <span className="text-xl font-bold text-brand-primaryHover">{stats.completedCourses}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-neutral-sand rounded-lg border border-border-subtle">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-accentSoft rounded-lg">
                        <FaCertificate className="text-brand-primary" />
                      </div>
                      <span className="font-medium text-light-text">Certificates</span>
                    </div>
                    <span className="text-xl font-bold text-brand-primary">{stats.certificatesEarned}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <a href="#/wishlist" className="bg-light-card border border-border-subtle rounded-xl p-6 text-center hover:border-brand-primary hover:shadow-sm transition-all group">
            <FaHeart className="text-4xl text-red-500 mx-auto mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-bold mb-2">My Wishlist</h3>
            <p className="text-light-textSecondary text-sm">Courses you're interested in.</p>
          </a>

          <a href="#/certificates" className="bg-light-card border border-border-subtle rounded-xl p-6 text-center hover:border-brand-primary hover:shadow-sm transition-all group">
            <FaCertificate className="text-4xl text-purple-500 mx-auto mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-bold mb-2">My Certificates</h3>
            <p className="text-light-textSecondary text-sm">View and share your achievements.</p>
          </a>

          <a href="#/courses" className="bg-light-card border border-border-subtle rounded-xl p-6 text-center hover:border-brand-primary hover:shadow-sm transition-all group">
            <FaBook className="text-4xl text-blue-500 mx-auto mb-4 transition-transform group-hover:scale-110" />
            <h3 className="text-xl font-bold mb-2">Browse Courses</h3>
            <p className="text-light-textSecondary text-sm">Explore more courses to learn.</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
