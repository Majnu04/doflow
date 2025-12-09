import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { RootState, AppDispatch } from '../src/store';
import { getAdminDashboardData, getRevenueAnalytics } from '../src/store/slices/adminSlice';
import { generateCourseOutline } from '../services/geminiService';
import { FiUsers, FiBookOpen, FiDollarSign, FiBarChart2, FiCode } from 'react-icons/fi';
import { EmptyState, ErrorState } from '../src/components/common/StateIndicators';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; accentBg: string }> = ({ title, value, icon, accentBg }) => (
  <div className="bg-light-card border border-border-subtle rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-md hover:border-brand-primary/70">
    <div className={`p-3 rounded-lg ${accentBg}`}>
      {icon}
    </div>
    <div>
      <p className="text-light-textMuted text-xs uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-semibold text-light-text">{value}</p>
    </div>
  </div>
);

const MONTH_FILTER_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatCount = (value: number = 0) => value.toLocaleString('en-IN');

const AdminDashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-light-card border border-border-subtle rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-light-cardAlt" />
          <div className="flex-1">
            <div className="h-4 rounded bg-light-cardAlt w-2/3 mb-2" />
            <div className="h-8 rounded bg-light-cardAlt w-1/2" />
          </div>
        </div>
      ))}
    </div>
    <div className="bg-light-card border border-border-subtle rounded-xl p-5 h-80 mb-8">
      <div className="h-full w-full bg-light-cardAlt rounded-lg" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-light-card border border-border-subtle rounded-xl p-5 h-80" />
      <div className="bg-light-card border border-border-subtle rounded-xl p-5 h-80" />
    </div>
  </div>
);

const CourseOutlineGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setOutline(null);
    try {
      const result = await generateCourseOutline(topic);
      setOutline(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-light-card border border-border-subtle rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-light-text mb-3">
        Course Outline Generator <span className="text-brand-primary">(AI)</span>
      </h3>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter course topic (e.g., React for Beginners)"
          className="flex-grow bg-light-bg border border-border-subtle rounded-xl px-4 py-2.5 text-light-text placeholder:text-light-textMuted focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold py-2.5 px-6 rounded-xl transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Generate'
          )}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {outline && (
        <div className="mt-5 p-5 bg-light-cardAlt rounded-xl max-h-96 overflow-y-auto border border-border-subtle/60">
          <h4 className="text-lg font-semibold text-light-text">{outline.courseTitle}</h4>
          <p className="text-light-textSecondary mt-1 mb-4">{outline.courseDescription}</p>
          {outline.modules.map((module: any, index: number) => (
            <div key={index} className="mb-4">
              <h5 className="font-semibold text-light-text mb-1">{`Module ${index + 1}: ${module.moduleTitle}`}</h5>
              <ul className="list-disc list-inside ml-4 text-light-textSecondary">
                {module.lessons.map((lesson: string, lessonIndex: number) => (
                  <li key={lessonIndex}>{lesson}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, status, error, revenueAnalytics, revenueStatus, revenueError } = useSelector((state: RootState) => state.admin);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const triggerRevenueFetch = useCallback(() => {
    dispatch(
      getRevenueAnalytics({
        year: Number(selectedYear),
        month: selectedMonth === 'all' ? undefined : Number(selectedMonth),
        courseId: selectedCourse === 'all' ? undefined : selectedCourse,
      })
    );
  }, [dispatch, selectedYear, selectedMonth, selectedCourse]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(getAdminDashboardData());
    }
  }, [status, dispatch]);

  useEffect(() => {
    triggerRevenueFetch();
  }, [triggerRevenueFetch]);

  const yearOptions = useMemo(() => {
    const availableYears = revenueAnalytics?.availableFilters?.years || [];
    const merged = new Set<number>(availableYears);
    merged.add(Number(selectedYear));
    return Array.from(merged).sort((a, b) => b - a);
  }, [revenueAnalytics, selectedYear]);

  const courseSelectOptions = useMemo(() => {
    const baseCourses = revenueAnalytics?.availableFilters?.courses || [];
    if (selectedCourse !== 'all' && !baseCourses.some((course) => course._id === selectedCourse)) {
      return [...baseCourses, { _id: selectedCourse, title: 'Selected Course' }];
    }
    return baseCourses;
  }, [revenueAnalytics, selectedCourse]);

  const selectedMonthLabel = useMemo(
    () => MONTH_FILTER_OPTIONS.find((option) => option.value === selectedMonth)?.label || 'All Months',
    [selectedMonth]
  );

  const selectedCourseLabel = selectedCourse === 'all'
    ? 'All Courses'
    : (courseSelectOptions.find((course) => course._id === selectedCourse)?.title || 'Selected Course');

  const analyticsLoading = revenueStatus === 'loading' && !revenueAnalytics;
  const isRefreshingAnalytics = revenueStatus === 'loading' && !!revenueAnalytics;

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen bg-light-bg text-light-text pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg pt-32 px-4">
        <ErrorState message={error || 'Failed to load dashboard data.'} onRetry={() => dispatch(getAdminDashboardData())} />
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg pt-32 px-4">
        <EmptyState title="No Data" message="Could not retrieve dashboard data." />
      </div>
    );
  }

  const { stats, recentUsers, recentCourses } = data;

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-light-textSecondary">Overview of the platform's performance.</p>
          </div>
          <a
            href="#/admin/dsa-course"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FiCode className="text-xl" />
            Manage DSA Courses
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<FiDollarSign className="text-emerald-600 text-2xl" />}
            accentBg="bg-emerald-50"
          />
          <StatCard
            title="Total Users"
            value={(stats?.totalUsers || 0).toLocaleString()}
            icon={<FiUsers className="text-sky-600 text-2xl" />}
            accentBg="bg-sky-50"
          />
          <StatCard
            title="Total Courses"
            value={(stats?.totalCourses || 0).toLocaleString()}
            icon={<FiBookOpen className="text-violet-600 text-2xl" />}
            accentBg="bg-violet-50"
          />
          <StatCard
            title="Total Enrollments"
            value={(stats?.totalEnrollments || 0).toLocaleString()}
            icon={<FiBarChart2 className="text-amber-600 text-2xl" />}
            accentBg="bg-amber-50"
          />
        </div>

        <div className="bg-light-card border border-border-subtle rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Revenue Analytics</h3>
              <p className="text-sm text-light-textMuted">
                {selectedMonthLabel} • {selectedYear} • {selectedCourseLabel}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="flex flex-col text-xs text-light-textMuted w-full sm:w-auto uppercase tracking-wide">
                <span className="mb-1">Year</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-light-bg border border-border-subtle rounded-xl px-4 py-2 text-light-text focus:ring-2 focus:ring-brand-primary/30"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-xs text-light-textMuted w-full sm:w-auto uppercase tracking-wide">
                <span className="mb-1">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-light-bg border border-border-subtle rounded-xl px-4 py-2 text-light-text focus:ring-2 focus:ring-brand-primary/30"
                >
                  {MONTH_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col text-xs text-light-textMuted w-full sm:w-auto uppercase tracking-wide">
                <span className="mb-1">Course</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-light-bg border border-border-subtle rounded-xl px-4 py-2 text-light-text focus:ring-2 focus:ring-brand-primary/30"
                >
                  <option value="all">All Courses</option>
                  {courseSelectOptions.map((course) => (
                    <option key={course._id} value={course._id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>
            {isRefreshingAnalytics && (
              <span className="text-xs font-semibold text-brand-primary">Updating…</span>
            )}
          </div>

          {analyticsLoading && (
            <div className="animate-pulse h-64 w-full rounded-xl bg-light-cardAlt" />
          )}

          {!analyticsLoading && revenueError && (
            <ErrorState message={revenueError} onRetry={triggerRevenueFetch} />
          )}

          {!analyticsLoading && !revenueError && revenueAnalytics && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
                  <p className="text-xs text-light-textMuted uppercase tracking-wide">Revenue</p>
                  <p className="text-2xl font-bold text-brand-primary">{formatCurrency(revenueAnalytics.summary.totalRevenue)}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs text-light-textMuted uppercase tracking-wide">Enrollments</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCount(revenueAnalytics.summary.totalEnrollments)}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs text-light-textMuted uppercase tracking-wide">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(revenueAnalytics.summary.averageOrderValue)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={revenueAnalytics.monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--page-accent)" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="var(--page-accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--page-border)" />
                      <XAxis dataKey="label" stroke="var(--page-text-muted)" fontSize={12} />
                      <YAxis stroke="var(--page-text-muted)" fontSize={12} tickFormatter={(value) => formatCurrency(Number(value))} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'var(--page-card)',
                          border: '1px solid var(--page-border)',
                          borderRadius: '0.75rem',
                          color: 'var(--page-text)',
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="var(--page-accent)" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-light-cardAlt border border-border-subtle rounded-2xl p-4">
                  <h4 className="text-lg font-semibold mb-4">Revenue by Course</h4>
                  <div className="max-h-72 overflow-y-auto pr-2">
                    {revenueAnalytics.courseRevenue.length > 0 ? (
                      revenueAnalytics.courseRevenue.map((course) => (
                        <div
                          key={`${course.courseId || course.courseTitle}`}
                          className="flex items-center justify-between py-3 border-b border-border-subtle/60 last:border-b-0"
                        >
                          <div>
                            <p className="font-semibold text-light-text">{course.courseTitle}</p>
                            <p className="text-xs text-light-textMuted">{formatCount(course.enrollments)} enrollment(s)</p>
                          </div>
                          <span className="font-semibold text-brand-primary">{formatCurrency(course.revenue)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-light-textMuted">No revenue recorded for this period.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-light-card border border-border-subtle rounded-2xl p-5">
            <h3 className="text-xl font-bold mb-4">Recent Users</h3>
            <div className="space-y-4">
              {recentUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=random`}
                      alt={u.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-light-text">{u.name}</p>
                      <p className="text-sm text-light-textMuted">{u.email}</p>
                    </div>
                  </div>
                  <a href={`#/admin/users/${u._id}`} className="text-sm text-brand-primary hover:underline">
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-light-card border border-border-subtle rounded-2xl p-5">
            <h3 className="text-xl font-bold mb-4">Recently Added Courses</h3>
            <div className="space-y-4">
              {recentCourses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-10 rounded-md object-cover flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-semibold truncate text-light-text">{course.title}</p>
                      <p className="text-sm text-light-textMuted">{formatCurrency(course.price)}</p>
                    </div>
                  </div>
                  <a href={`#/admin/courses/${course._id}`} className="text-sm text-brand-primary hover:underline flex-shrink-0 ml-2">
                    Manage
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CourseOutlineGenerator />
      </div>
    </div>
  );
};

export default AdminDashboard;
