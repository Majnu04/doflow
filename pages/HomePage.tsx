import React, { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { getCourses } from '../src/store/slices/coursesSlice';
import { CourseGridSkeleton, EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { FiPlay, FiUsers, FiAward, FiTrendingUp, FiClock, FiStar, FiArrowRight, FiCode, FiMonitor, FiBarChart2, FiSmartphone, FiLayout, FiBriefcase } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';
import { Course } from '../src/store/slices/coursesSlice'; // Import Course type

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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!courses.length && !isLoading) {
      dispatch(getCourses({}));
    }
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
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
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
    if (stat.format === 'percent') {
      return {
        ...stat,
        displayValue: `${Math.round(currentValue)}${stat.suffix}`,
      };
    }

    return {
      ...stat,
      displayValue: `${compactNumberFormatter.format(Math.max(0, Math.round(currentValue)))}` +
        (stat.suffix || ''),
    };
  });

  // Memoize featured courses to prevent re-sorting on every render
  const featuredCourses = React.useMemo(() => {
    // The DSA course is special and should always be featured if present
    const dsaCourse = courses.find(c => c.isDSA);
    // Other courses sorted by rating
    const otherCourses = courses
      .filter(c => !c.isDSA)
      .slice()
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));

    const topCourses = dsaCourse ? [dsaCourse, ...otherCourses] : otherCourses;
    
    return topCourses.slice(0, 4);
  }, [courses]);

  const features = [
    {
      icon: <FiPlay className="w-6 h-6" />,
      title: 'HD Video Lessons',
      description: 'Learn with crystal clear video content at your own pace',
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: 'Lifetime Access',
      description: 'Get unlimited access to all course materials forever',
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: 'Certification',
      description: 'Earn industry-recognized certificates upon completion',
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: 'Expert Support',
      description: '24/7 support from our expert instructors and community',
    },
  ];

  const categories = [
    { name: 'DSA & Coding', count: 1, icon: <FiCode className="w-6 h-6" /> },
    { name: 'Web Development', count: 120, icon: <FiMonitor className="w-6 h-6" /> },
    { name: 'Data Science', count: 85, icon: <FiBarChart2 className="w-6 h-6" /> },
    { name: 'Mobile Development', count: 65, icon: <FiSmartphone className="w-6 h-6" /> },
    { name: 'UI/UX Design', count: 90, icon: <FiLayout className="w-6 h-6" /> },
    { name: 'Business', count: 110, icon: <FiBriefcase className="w-6 h-6" /> },
  ];

  const heroCourse = featuredCourses[0];

  return (
    <div className="min-h-screen bg-light-bg text-light-text transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={`space-y-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <span className="pill">
                ✨ Learning reinvented for builders
              </span>
              <h1 className="heading-hero font-display text-light-text">
                Master modern skills with confidence
                <span className="block text-brand-primary">guided by DoFlow</span>
              </h1>
              <p className="text-fluid-base text-light-textSecondary max-w-2xl">
                Handcrafted courses, immersive coding labs, and human mentorship—all wrapped in a single learning OS designed to keep you focused, inspired, and job-ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="primary"
                  icon={<FiPlay className="w-5 h-5" />}
                  onClick={() => window.location.hash = '/courses'}
                >
                  Explore Catalogue
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  icon={<FiArrowRight className="w-5 h-5" />}
                  onClick={() => window.location.hash = isAuthenticated ? '/dashboard' : '/auth'}
                  className="backdrop-blur"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {animatedStats.map((stat) => (
                  <Card
                    key={stat.id}
                    hover={false}
                    variant="glass"
                    className={`p-5 text-left ${isVisible ? 'animate-scale-in' : ''}`}
                  >
                    <div className="text-brand-primary text-2xl mb-2">
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-semibold text-light-text">{stat.displayValue}</p>
                    <p className="text-sm text-light-textMuted">{stat.label}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className={`relative ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} transition-all duration-700 delay-150`}>
              <div className="absolute inset-0 blur-3xl bg-brand-primary/20 rounded-full translate-y-10" />
              <Card variant="glass" hover={false} className="relative overflow-hidden p-6 md:p-8 border-0 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-light-textMuted">Spotlight</p>
                    <h3 className="text-2xl font-semibold text-light-text">
                      {heroCourse?.title || 'Immersive Fullstack Cohort'}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="hidden md:inline-flex">Live</Badge>
                </div>
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                  {heroCourse?.thumbnail ? (
                    <img src={heroCourse.thumbnail} alt={heroCourse.title} className="w-full h-full object-cover scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/30 via-brand-gold/20 to-transparent" />
                  )}
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-light-textMuted">
                  <div>
                    <p className="text-xs uppercase tracking-wide">Mentor</p>
                    <p className="font-semibold text-light-text">{typeof heroCourse?.instructor === 'string' ? heroCourse?.instructor : heroCourse?.instructor?.name || 'DoFlow Team'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide">Duration</p>
                    <p className="font-semibold text-light-text">{heroCourse?.estimatedDuration || '8 weeks'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide">Rating</p>
                    <p className="font-semibold text-light-text flex items-center gap-1"><FiStar className="text-brand-accent" /> {heroCourse?.averageRating?.toFixed(1) || '4.9'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-light-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-light-card border border-border-subtle rounded-full transition-colors duration-300">
              <span className="text-sm font-medium text-light-textMuted transition-colors duration-300">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-light-text mb-4 transition-colors duration-300">
              Learn Smarter, Not Harder
            </h2>
            <p className="text-lg text-light-textSecondary max-w-2xl mx-auto transition-colors duration-300">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-light-card border border-border-subtle rounded-2xl p-6 hover:border-brand-primary hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors duration-300">
                  <div className="text-brand-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-light-text mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-light-textSecondary text-sm leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-light-cardAlt transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-light-card border border-border-subtle rounded-full transition-colors duration-300">
              <span className="text-sm font-medium text-light-textMuted transition-colors duration-300">Popular Categories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-light-text mb-4 transition-colors duration-300">
              Explore by Category
            </h2>
            <p className="text-lg text-light-textSecondary max-w-2xl mx-auto transition-colors duration-300">
              Find the perfect course for your goals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = `/courses?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-light-card border border-border-subtle rounded-xl p-5 text-center hover:border-brand-primary/60 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-center justify-center mb-3 text-brand-primary group-hover:text-brand-primaryHover transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="text-sm font-semibold text-light-text mb-1 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-xs text-light-textMuted transition-colors duration-300">
                  {category.count} Courses
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 md:py-24 bg-light-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                <span className="text-sm font-medium text-brand-gold">Featured Courses</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-light-text transition-colors duration-300">
                Most Popular Courses
              </h2>
            </div>
            <button
              onClick={() => window.location.hash = '/courses'}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-light-card hover:bg-light-cardAlt text-light-text font-medium rounded-lg border border-border-subtle transition-all duration-300"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              <CourseGridSkeleton count={4} />
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
                  className="bg-light-card border border-border-subtle rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-md transition-all group text-left"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1 bg-brand-primary text-white text-xs font-medium rounded-md">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-light-text mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-light-textSecondary mb-4">by {typeof course.instructor === 'string' ? course.instructor : course.instructor?.name || 'DoFlow Academy'}</p>

                    <div className="flex items-center gap-4 mb-4 text-xs text-light-textMuted">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-brand-accent w-3.5 h-3.5" />
                        <span className="font-semibold text-light-text">{course.averageRating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="w-3.5 h-3.5" />
                        <span>{course.enrollmentCount || 0} students</span>
                      </div>
                      {course.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          <span>{course.estimatedDuration}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <div>
                        {course.price === 0 ? (
                          <span className="text-xl font-bold text-brand-primary">Free</span>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-light-text">${course.price}</span>
                            {course.originalPrice && course.originalPrice > course.price && (
                              <span className="text-sm text-light-textMuted line-through">${course.originalPrice}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary">View Details</Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="text-center mt-12 md:hidden">
            <button
              onClick={() => window.location.hash = '/courses'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              View All Courses
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;