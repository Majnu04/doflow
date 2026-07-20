import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { RootState, AppDispatch } from '../src/store';
import { getAdminDashboardData, getRevenueAnalytics } from '../src/store/slices/adminSlice';
import { generateCourseOutline } from '../services/geminiService';
import { StatCard, Badge, Button, Tabs, Input } from '../src/components/ui';
import { EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { FiUsers, FiBookOpen, FiDollarSign, FiBarChart2, FiCode, FiTrendingUp, FiActivity, FiSettings, FiSend } from 'react-icons/fi';

const MONTH_FILTER_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '1', label: 'January' }, { value: '2', label: 'February' },
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const formatCurrency = (value: number = 0) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatCount = (value: number = 0) => value.toLocaleString('en-IN');

const AdminDashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-light-card border border-border-subtle rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-light-cardAlt" />
          </div>
          <div className="h-8 bg-light-cardAlt rounded-lg w-1/2 mb-1" />
          <div className="h-3 bg-light-cardAlt rounded-lg w-2/3" />
        </div>
      ))}
    </div>
    <div className="bg-light-card border border-border-subtle rounded-2xl p-6 h-80" />
  </div>
);

const CourseOutlineGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic) { setError('Please enter a topic.'); return; }
    setIsLoading(true); setError(null); setOutline(null);
    try {
      const result = await generateCourseOutline(topic);
      setOutline(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="bg-light-card border border-border-subtle rounded-2xl p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-brand-primary/10 rounded-xl">
          <FiCode className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-light-text">Course Outline Generator</h3>
          <p className="text-xs text-light-textMuted">Powered by AI</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter course topic (e.g., React for Beginners)"
          className="flex-grow px-4 py-2.5 bg-light-cardAlt/60 border border-border-subtle/40 rounded-xl text-sm text-light-text placeholder:text-light-textMuted/60 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
        />
        <Button
          variant="primary"
          size="md"
          isLoading={isLoading}
          icon={<FiSend className="w-4 h-4" />}
          onClick={handleGenerate}
        >
          Generate
        </Button>
      </div>
      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
      {outline && (
        <div className="p-4 bg-light-cardAlt/60 rounded-xl border border-border-subtle/40 max-h-80 overflow-y-auto">
          <h4 className="text-base font-bold text-light-text mb-1">{outline.courseTitle}</h4>
          <p className="text-sm text-light-textSecondary mb-4">{outline.courseDescription}</p>
          {outline.modules.map((module: any, index: number) => (
            <div key={index} className="mb-3">
              <h5 className="text-sm font-bold text-light-text mb-1">Module {index + 1}: {module.moduleTitle}</h5>
              <ul className="list-disc list-inside ml-4 text-sm text-light-textSecondary space-y-0.5">
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
    dispatch(getRevenueAnalytics({
      year: Number(selectedYear),
      month: selectedMonth === 'all' ? undefined : Number(selectedMonth),
      courseId: selectedCourse === 'all' ? undefined : selectedCourse,
    }));
  }, [dispatch, selectedYear, selectedMonth, selectedCourse]);

  useEffect(() => {
    if (status === 'idle') dispatch(getAdminDashboardData());
  }, [status, dispatch]);

  useEffect(() => { triggerRevenueFetch(); }, [triggerRevenueFetch]);

  const yearOptions = useMemo(() => {
    const availableYears = revenueAnalytics?.availableFilters?.years || [];
    const merged = new Set<number>(availableYears);
    merged.add(Number(selectedYear));
    return Array.from(merged).sort((a, b) => b - a);
  }, [revenueAnalytics, selectedYear]);

  const courseSelectOptions = useMemo(() => {
    const baseCourses = revenueAnalytics?.availableFilters?.courses || [];
    if (selectedCourse !== 'all' && !baseCourses.some((course: any) => course._id === selectedCourse)) {
      return [...baseCourses, { _id: selectedCourse, title: 'Selected Course' }];
    }
    return baseCourses;
  }, [revenueAnalytics, selectedCourse]);

  const selectedMonthLabel = MONTH_FILTER_OPTIONS.find((option) => option.value === selectedMonth)?.label || 'All Months';
  const selectedCourseLabel = selectedCourse === 'all' ? 'All Courses' : (courseSelectOptions.find((course: any) => course._id === selectedCourse)?.title || 'Selected Course');

  const analyticsLoading = revenueStatus === 'loading' && !revenueAnalytics;
  const isRefreshingAnalytics = revenueStatus === 'loading' && !!revenueAnalytics;

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-screen bg-light-bg text-light-text pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg pt-24 px-4">
        <ErrorState message={error || 'Failed to load dashboard data.'} onRetry={() => dispatch(getAdminDashboardData())} />
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg pt-24 px-4">
        <EmptyState title="No Data" message="Could not retrieve dashboard data." />
      </div>
    );
  }

  const { stats, recentUsers, recentCourses } = data;

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-light-textSecondary">Platform performance overview</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<FiCode className="w-4 h-4" />}
            onClick={() => window.location.hash = '#/admin/dsa-course'}
          >
            Manage DSA Courses
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats?.totalRevenue || 0)}
            icon={<FiDollarSign className="w-5 h-5" />}
            accent="bg-emerald-50 text-emerald-600"
            change={12}
          />
          <StatCard
            title="Total Users"
            value={formatCount(stats?.totalUsers || 0)}
            icon={<FiUsers className="w-5 h-5" />}
            accent="bg-sky-50 text-sky-600"
            change={8}
          />
          <StatCard
            title="Total Courses"
            value={formatCount(stats?.totalCourses || 0)}
            icon={<FiBookOpen className="w-5 h-5" />}
            accent="bg-violet-50 text-violet-600"
          />
          <StatCard
            title="Total Enrollments"
            value={formatCount(stats?.totalEnrollments || 0)}
            icon={<FiBarChart2 className="w-5 h-5" />}
            accent="bg-amber-50 text-amber-600"
            change={15}
          />
        </div>

        {/* Revenue Analytics */}
        <div className="bg-light-card border border-border-subtle rounded-2xl p-6 mb-6 shadow-card">
          <div className="flex flex-wrap gap-3 items-start justify-between mb-5">
            <div>
              <h3 className="text-base font-bold">Revenue Analytics</h3>
              <p className="text-xs text-light-textMuted mt-0.5">
                {selectedMonthLabel} · {selectedYear} · {selectedCourseLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-light-cardAlt/60 border border-border-subtle/40 rounded-lg text-xs text-light-text focus:ring-2 focus:ring-brand-primary/20"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-light-cardAlt/60 border border-border-subtle/40 rounded-lg text-xs text-light-text focus:ring-2 focus:ring-brand-primary/20"
              >
                {MONTH_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-1.5 bg-light-cardAlt/60 border border-border-subtle/40 rounded-lg text-xs text-light-text focus:ring-2 focus:ring-brand-primary/20"
              >
                <option value="all">All Courses</option>
                {courseSelectOptions.map((course: any) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
              {isRefreshingAnalytics && (
                <span className="text-[10px] font-semibold text-brand-primary self-center">Updating...</span>
              )}
            </div>
          </div>

          {analyticsLoading && (
            <div className="animate-pulse h-64 w-full rounded-xl bg-light-cardAlt" />
          )}

          {!analyticsLoading && revenueError && (
            <ErrorState message={revenueError} onRetry={triggerRevenueFetch} />
          )}

          {!analyticsLoading && !revenueError && revenueAnalytics && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                  <p className="text-[10px] text-light-textMuted uppercase tracking-wide mb-1">Revenue</p>
                  <p className="text-xl font-bold text-brand-primary">{formatCurrency(revenueAnalytics.summary.totalRevenue)}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                  <p className="text-[10px] text-light-textMuted uppercase tracking-wide mb-1">Enrollments</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCount(revenueAnalytics.summary.totalEnrollments)}</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100/60">
                  <p className="text-[10px] text-light-textMuted uppercase tracking-wide mb-1">Avg. Order Value</p>
                  <p className="text-xl font-bold text-amber-600">{formatCurrency(revenueAnalytics.summary.averageOrderValue)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueAnalytics.monthlyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--page-accent)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--page-accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--page-border)" strokeOpacity={0.5} />
                      <XAxis dataKey="label" stroke="var(--page-text-muted)" fontSize={11} />
                      <YAxis stroke="var(--page-text-muted)" fontSize={11} tickFormatter={(value) => formatCurrency(Number(value))} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(Number(value))}
                        contentStyle={{
                          backgroundColor: 'var(--page-card)',
                          border: '1px solid var(--page-border)',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                          boxShadow: '0 4px 16px rgba(32, 29, 25, 0.08)',
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="var(--page-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-light-cardAlt/60 border border-border-subtle/40 rounded-xl p-4">
                  <h4 className="text-sm font-bold mb-3">Revenue by Course</h4>
                  <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
                    {revenueAnalytics.courseRevenue.length > 0 ? (
                      revenueAnalytics.courseRevenue.map((course: any) => (
                        <div
                          key={`${course.courseId || course.courseTitle}`}
                          className="flex items-center justify-between py-2.5 border-b border-border-subtle/30 last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-light-text truncate">{course.courseTitle}</p>
                            <p className="text-[10px] text-light-textMuted">{formatCount(course.enrollments)} enrollments</p>
                          </div>
                          <span className="text-xs font-bold text-brand-primary ml-2 flex-shrink-0">{formatCurrency(course.revenue)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-light-textMuted py-4 text-center">No revenue recorded for this period.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Users & Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
            <h3 className="text-base font-bold mb-4">Recent Users</h3>
            <div className="space-y-3">
              {recentUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=E06438&color=fff`}
                      alt={u.name}
                      className="w-9 h-9 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-light-text truncate">{u.name}</p>
                      <p className="text-xs text-light-textMuted truncate">{u.email}</p>
                    </div>
                  </div>
                  <a href={`#/admin/users/${u._id}`} className="text-xs text-brand-primary hover:text-brand-primaryHover font-medium flex-shrink-0 ml-2">
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-light-card border border-border-subtle rounded-2xl p-5 shadow-card">
            <h3 className="text-base font-bold mb-4">Recently Added Courses</h3>
            <div className="space-y-3">
              {recentCourses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-14 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-light-text">{course.title}</p>
                      <p className="text-xs text-light-textMuted">{formatCurrency(course.price)}</p>
                    </div>
                  </div>
                  <a href={`#/admin/courses/${course._id}`} className="text-xs text-brand-primary hover:text-brand-primaryHover font-medium flex-shrink-0 ml-2">
                    Manage
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Course Outline Generator */}
        <CourseOutlineGenerator />
      </div>
    </div>
  );
};

export default AdminDashboard;
