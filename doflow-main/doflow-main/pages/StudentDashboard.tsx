import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getStudentDashboardData } from '../src/store/slices/dashboardSlice';
import { getGamificationData } from '../src/store/slices/gamificationSlice';
import { StreakCard, XPCard, DailyGoalsCard, ActivityTimeline, WeeklyStatsCard, LearningHeatmap } from '../src/components/dashboard';
import { StatCard, Badge, Button, Avatar, ProgressBar } from '../src/components/ui';
import { CourseGridSkeleton, EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { isDsaCourse } from '../src/utils/courseUtils';
import { FiBook, FiAward, FiTrendingUp, FiClock, FiHeart, FiBookOpen, FiChevronRight, FiTarget, FiStar } from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { enrollments, stats, status, error } = useSelector((state: RootState) => state.dashboard);
  const gamification = useSelector((state: RootState) => state.gamification);

  useEffect(() => {
    if (user) {
      dispatch(getStudentDashboardData());
      dispatch(getGamificationData());
    }
  }, [dispatch, user]);

  const continueLearning = useMemo(() => {
    return enrollments
      .filter(e => e.progress > 0 && e.progress < 100)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);
  }, [enrollments]);

  const recommendedCourses = useMemo(() => {
    return enrollments
      .filter(e => e.progress === 0)
      .slice(0, 3);
  }, [enrollments]);

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
    <div className="min-h-screen bg-light-bg text-light-text pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-2">
            <Avatar name={user.name} size="lg" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-light-textSecondary text-sm">
                Let's continue your learning journey today.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8 stagger-children">
          {status === 'failed' ? (
            <div className="col-span-full bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-red-600 font-medium mb-2">{error || 'Failed to load dashboard data'}</p>
              <Button variant="outline" size="sm" onClick={() => dispatch(getStudentDashboardData())}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <StatCard
                title="Enrolled Courses"
                value={stats.totalCourses}
                icon={<FiBookOpen className="w-5 h-5" />}
                accent="bg-sky-50 text-sky-600"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgressCourses}
                icon={<FiTrendingUp className="w-5 h-5" />}
                accent="bg-amber-50 text-amber-600"
                change={stats.inProgressCourses > 0 ? 12 : undefined}
              />
              <StatCard
                title="Completed"
                value={stats.completedCourses}
                icon={<FiTarget className="w-5 h-5" />}
                accent="bg-emerald-50 text-emerald-600"
                change={stats.completedCourses > 0 ? 8 : undefined}
              />
              <StatCard
                title="Certificates"
                value={stats.certificatesEarned}
                icon={<FiAward className="w-5 h-5" />}
                accent="bg-violet-50 text-violet-600"
              />
              <StatCard
                title="Hours Learned"
                value={stats.totalHoursLearned}
                icon={<FiClock className="w-5 h-5" />}
                accent="bg-cyan-50 text-cyan-600"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <div className="animate-slide-up-fade">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Continue Learning</h2>
                {continueLearning.length > 0 && (
                  <a href="#/courses" className="text-xs font-medium text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 transition-colors">
                    View all <FiChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              {status === 'loading' || status === 'idle' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-light-card border border-border-subtle rounded-2xl overflow-hidden animate-pulse">
                      <div className="h-32 bg-light-cardAlt" />
                      <div className="p-4 space-y-2">
                        <div className="h-5 bg-light-cardAlt rounded-lg w-3/4" />
                        <div className="h-3 bg-light-cardAlt rounded-lg w-1/2" />
                        <div className="h-1.5 bg-light-cardAlt rounded-full w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : status === 'failed' ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <p className="text-sm text-red-600 font-medium mb-3">{error || 'Unable to load your courses'}</p>
                  <Button variant="outline" size="sm" onClick={() => dispatch(getStudentDashboardData())}>
                    Retry
                  </Button>
                </div>
              ) : continueLearning.length === 0 ? (
                <div className="bg-light-card border border-border-subtle rounded-2xl p-8 text-center">
                  <FiStar className="w-10 h-10 text-brand-primary/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-light-text mb-1">Ready to start learning?</p>
                  <p className="text-xs text-light-textMuted mb-4">Pick up where you left off or explore new courses.</p>
                  <Button variant="primary" size="sm" onClick={() => window.location.hash = '/courses'}>
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {continueLearning.map(enrollment => {
                    const course = enrollment.course;
                    const isDsa = isDsaCourse(course);
                    const courseLink = isDsa
                      ? `#/dsa/problems/${course?._id}`
                      : `#/learn/${course?._id}`;

                    return (
                      <a
                        key={enrollment._id}
                        href={courseLink}
                        className="premium-card group"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={course?.thumbnail || 'https://placehold.co/600x400/1a1a2e/ffffff?text=Course'}
                            alt={course?.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <Badge variant={isDsa ? 'primary' : 'secondary'} size="xs">
                              {isDsa ? 'DSA' : 'Video Course'}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-bold text-light-text mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
                            {course?.title}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-light-textMuted">Progress</span>
                            <span className="text-[10px] font-bold text-brand-primary">{enrollment.progress}%</span>
                          </div>
                          <ProgressBar value={enrollment.progress} size="xs" animated />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Courses */}
            <div className="animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">My Courses</h2>
                <a href="#/courses" className="text-xs font-medium text-brand-primary hover:text-brand-primaryHover flex items-center gap-1 transition-colors">
                  Browse More <FiChevronRight className="w-3 h-3" />
                </a>
              </div>

              {status === 'loading' || status === 'idle' ? (
                <CourseGridSkeleton count={3} />
              ) : status === 'failed' ? (
                <ErrorState message={error || "Couldn't load your courses."} onRetry={() => dispatch(getStudentDashboardData())} />
              ) : enrollments.length === 0 ? (
                <EmptyState
                  icon={<FiBook className="w-12 h-12 text-brand-primary/40" />}
                  title="No Courses Yet"
                  message="You haven't enrolled in any courses. Time to start learning!"
                  action={
                    <Button variant="primary" size="sm" onClick={() => window.location.hash = '/courses'}>
                      Explore Courses
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        className="premium-card group"
                      >
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={course?.thumbnail || 'https://placehold.co/600x400/1a1a2e/ffffff?text=Course'}
                            alt={course?.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3">
                            {enrollment.certificateIssued && (
                              <div className="p-1.5 bg-emerald-500 rounded-lg">
                                <FiAward className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-bold text-light-text mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                            {course?.title}
                          </h3>
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-light-textMuted">Progress</span>
                              <span className="text-[10px] font-bold text-brand-primary">{enrollment.progress}%</span>
                            </div>
                            <ProgressBar value={enrollment.progress} size="xs" animated />
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40">
                            <span className="text-xs font-medium text-light-text">
                              {isDsa ? 'Open Workspace' : enrollment.progress === 0 ? 'Start Learning' : 'Continue'}
                            </span>
                            <FiChevronRight className="w-4 h-4 text-light-textMuted group-hover:text-brand-primary transition-colors" />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Gamification Sidebar */}
          <div className="space-y-4 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
            <StreakCard streak={gamification.streak} />
            <XPCard xp={gamification.xp} />
            <DailyGoalsCard goals={gamification.dailyGoals} />
            <WeeklyStatsCard stats={gamification.weeklyStats} />
          </div>
        </div>

        {/* Bottom Section - Heatmap & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LearningHeatmap />
          <ActivityTimeline activities={gamification.activities} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          <a href="#/wishlist" className="premium-card group p-5 text-center">
            <div className="p-3 bg-rose-50 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <FiHeart className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold mb-1">My Wishlist</h3>
            <p className="text-xs text-light-textMuted">Courses you're interested in</p>
          </a>

          <a href="#/certificates" className="premium-card group p-5 text-center">
            <div className="p-3 bg-violet-50 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <FiAward className="w-6 h-6 text-violet-500" />
            </div>
            <h3 className="text-sm font-bold mb-1">My Certificates</h3>
            <p className="text-xs text-light-textMuted">View and share achievements</p>
          </a>

          <a href="#/courses" className="premium-card group p-5 text-center">
            <div className="p-3 bg-sky-50 rounded-2xl w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <FiBook className="w-6 h-6 text-sky-500" />
            </div>
            <h3 className="text-sm font-bold mb-1">Browse Courses</h3>
            <p className="text-xs text-light-textMuted">Explore more to learn</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
