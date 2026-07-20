import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getCourses } from '../src/store/slices/coursesSlice';
import { CourseGridSkeleton, EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { Button, Card, Badge, ProgressBar } from '../src/components/ui';
import { Course } from '../src/store/slices/coursesSlice';
import { FiPlay, FiUsers, FiAward, FiTrendingUp, FiClock, FiStar, FiArrowRight, FiCode, FiMonitor, FiBarChart2, FiSmartphone, FiLayout, FiBriefcase, FiZap, FiCheckCircle } from 'react-icons/fi';

const HERO_STATS = [
  { id: 'students', icon: <FiUsers />, target: 50000, label: 'Active Students', suffix: '+', format: 'compact' as const },
  { id: 'courses', icon: <FiPlay />, target: 500, label: 'Video Courses', suffix: '+', format: 'compact' as const },
  { id: 'instructors', icon: <FiAward />, target: 100, label: 'Expert Instructors', suffix: '+', format: 'compact' as const },
  { id: 'success', icon: <FiTrendingUp />, target: 95, label: 'Success Rate', suffix: '%', format: 'percent' as const },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const HomePage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { courses, isLoading, error } = useSelector((state: RootState) => state.courses);
  const [isVisible, setIsVisible] = useState(false);
  const [statProgress, setStatProgress] = useState(0);

  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    if (!courses.length && !isLoading) dispatch(getCourses({}));
  }, [courses.length, isLoading, dispatch]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const startTime = performance.now();
    let frameId: number;
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setStatProgress(easeOutCubic(progress));
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible]);

  const compactNumberFormatter = useMemo(
    () => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }),
    []
  );

  const animatedStats = HERO_STATS.map((stat) => {
    const currentValue = stat.target * statProgress;
    return {
      ...stat,
      displayValue: stat.format === 'percent'
        ? `${Math.round(currentValue)}${stat.suffix}`
        : `${compactNumberFormatter.format(Math.max(0, Math.round(currentValue)))}${stat.suffix || ''}`,
    };
  });

  const featuredCourses = React.useMemo(() => {
    const dsaCourse = courses.find(c => c.isDSA);
    const otherCourses = courses.filter(c => !c.isDSA).slice().sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    const topCourses = dsaCourse ? [dsaCourse, ...otherCourses] : otherCourses;
    return topCourses.slice(0, 4);
  }, [courses]);

  const features = [
    { icon: <FiPlay className="w-5 h-5" />, title: 'HD Video Lessons', description: 'Crystal clear video content at your own pace' },
    { icon: <FiClock className="w-5 h-5" />, title: 'Lifetime Access', description: 'Unlimited access to all course materials forever' },
    { icon: <FiAward className="w-5 h-5" />, title: 'Certification', description: 'Earn industry-recognized certificates' },
    { icon: <FiUsers className="w-5 h-5" />, title: 'Expert Support', description: '24/7 support from expert instructors' },
  ];

  const categories = [
    { name: 'DSA & Coding', count: 1, icon: <FiCode className="w-5 h-5" /> },
    { name: 'Web Development', count: 120, icon: <FiMonitor className="w-5 h-5" /> },
    { name: 'Data Science', count: 85, icon: <FiBarChart2 className="w-5 h-5" /> },
    { name: 'Mobile Development', count: 65, icon: <FiSmartphone className="w-5 h-5" /> },
    { name: 'UI/UX Design', count: 90, icon: <FiLayout className="w-5 h-5" /> },
    { name: 'Business', count: 110, icon: <FiBriefcase className="w-5 h-5" /> },
  ];

  const heroCourse = featuredCourses[0];

  return (
    <div className="min-h-screen bg-light-bg text-light-text transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="absolute inset-0 -z-10 dot-background opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={`space-y-6 transition-all duration-700 ease-expo ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="pill">
                <FiZap className="w-3.5 h-3.5" /> Learning reinvented for builders
              </span>
              <h1 className="heading-hero font-display text-light-text">
                Master modern skills
                <span className="block gradient-text">with confidence</span>
              </h1>
              <p className="text-fluid-base text-light-textSecondary max-w-xl leading-relaxed">
                Handcrafted courses, immersive coding labs, and AI-powered mentorship — all in a single learning platform designed to keep you focused, inspired, and job-ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="primary"
                  icon={<FiPlay className="w-4 h-4" />}
                  onClick={() => window.location.hash = '/courses'}
                >
                  Explore Catalogue
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  icon={<FiArrowRight className="w-4 h-4" />}
                  onClick={() => window.location.hash = isAuthenticated ? '/dashboard' : '/auth'}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {animatedStats.map((stat, i) => (
                  <Card
                    key={stat.id}
                    hover={false}
                    variant="glass"
                    padding="sm"
                    className={`text-left ${isVisible ? 'animate-scale-in' : ''}`}
                    style={{ animationDelay: `${i * 80}ms` } as any}
                  >
                    <div className="text-brand-primary text-lg mb-1.5">
                      {stat.icon}
                    </div>
                    <p className="text-xl font-bold text-light-text">{stat.displayValue}</p>
                    <p className="text-[10px] text-light-textMuted">{stat.label}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className={`relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 ease-expo delay-150`}>
              <div className="absolute inset-0 blur-3xl bg-brand-primary/15 rounded-full translate-y-10" />
              <Card variant="glass" hover={false} className="relative overflow-hidden p-6 md:p-7 border-0 shadow-elevated">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-light-textMuted mb-1">Spotlight</p>
                    <h3 className="text-lg font-bold text-light-text">
                      {heroCourse?.title || 'Immersive Fullstack Cohort'}
                    </h3>
                  </div>
                  <Badge variant="primary" size="xs" dot>Live</Badge>
                </div>
                <div className="relative h-44 rounded-xl overflow-hidden mb-5">
                  {heroCourse?.thumbnail ? (
                    <img src={heroCourse.thumbnail} alt={heroCourse.title} loading="lazy" className="w-full h-full object-cover scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 via-brand-accent/15 to-transparent" />
                  )}
                </div>
                <div className="flex flex-wrap gap-5 text-xs text-light-textMuted">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide mb-0.5">Mentor</p>
                    <p className="font-semibold text-light-text">{typeof heroCourse?.instructor === 'string' ? heroCourse?.instructor : heroCourse?.instructor?.name || 'DoFlow Team'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide mb-0.5">Duration</p>
                    <p className="font-semibold text-light-text">{heroCourse?.estimatedDuration || '8 weeks'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide mb-0.5">Rating</p>
                    <p className="font-semibold text-light-text flex items-center gap-1">
                      <FiStar className="text-brand-accent w-3 h-3" /> {heroCourse?.averageRating?.toFixed(1) || '4.9'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="pill mb-4 inline-flex">Why Choose Us</span>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Learn Smarter, Not Harder
            </h2>
            <p className="text-sm text-light-textSecondary max-w-lg mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {features.map((feature, index) => (
              <div
                key={index}
                className="premium-card p-5 group"
              >
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-primary/15 transition-colors duration-300">
                  <div className="text-brand-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-sm font-bold text-light-text mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-xs text-light-textSecondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-20 bg-light-cardAlt/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="pill mb-4 inline-flex">Popular Categories</span>
            <h2 className="text-2xl md:text-4xl font-bold mb-3">
              Explore by Category
            </h2>
            <p className="text-sm text-light-textSecondary max-w-lg mx-auto">
              Find the perfect course for your goals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = `/courses?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="premium-card p-4 text-center group"
              >
                <div className="flex items-center justify-center mb-2.5 text-brand-primary group-hover:text-brand-primaryHover transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="text-xs font-bold text-light-text mb-0.5">
                  {category.name}
                </h3>
                <p className="text-[10px] text-light-textMuted">
                  {category.count} Courses
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="pill mb-3 inline-flex">
                <FiStar className="w-3 h-3" /> Featured
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">
                Most Popular Courses
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<FiArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => window.location.hash = '/courses'}
              className="hidden md:inline-flex"
            >
              View All
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-full"><CourseGridSkeleton count={4} /></div>
            ) : error ? (
              <div className="col-span-full">
                <ErrorState message={error || "Failed to load courses."} onRetry={() => dispatch(getCourses({}))} />
              </div>
            ) : featuredCourses.length === 0 ? (
              <div className="col-span-full">
                <EmptyState title="No Courses Yet" message="No featured courses available at the moment." />
              </div>
            ) : (
              featuredCourses.map((course) => (
                <button
                  key={course._id}
                  onClick={() => {
                    if (course.isDSA && course._id) {
                      window.location.hash = `/dsa/problems/${course._id}`;
                    } else {
                      window.location.hash = `/course/${course._id}`;
                    }
                  }}
                  className="premium-card group text-left"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary" size="xs">{course.level}</Badge>
                    </div>
                    {course.isDSA && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="gold" size="xs" dot>Featured</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-light-text mb-1.5 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-light-textSecondary mb-3">by {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'DoFlow Academy'}</p>

                    <div className="flex items-center gap-3 mb-3 text-[10px] text-light-textMuted">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-brand-accent w-3 h-3" />
                        <span className="font-semibold text-light-text">{course.averageRating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-3 h-3" />
                        <span>{course.enrollmentCount || 0}</span>
                      </div>
                      {course.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          <span>{course.estimatedDuration}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40">
                      <div>
                        {course.price === 0 ? (
                          <span className="text-lg font-bold text-emerald-500">Free</span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-light-text">₹{course.price}</span>
                            {course.discountPrice && course.discountPrice < course.price && (
                              <span className="text-xs text-light-textMuted line-through">₹{course.discountPrice}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge variant="secondary" size="xs">View Details</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Button
              variant="primary"
              size="md"
              icon={<FiArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => window.location.hash = '/courses'}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
