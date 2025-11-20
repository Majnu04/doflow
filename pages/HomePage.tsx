import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { FiPlay, FiUsers, FiAward, FiTrendingUp, FiClock, FiStar, FiArrowRight, FiCode, FiMonitor, FiBarChart2, FiSmartphone, FiLayout, FiBriefcase } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStudents, setActiveStudents] = useState(0);
  const [videoCourses, setVideoCourses] = useState(0);
  const [expertInstructors, setExpertInstructors] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [dsaCourses, setDsaCourses] = useState(0);
  const [webCourses, setWebCourses] = useState(0);
  const [dataCourses, setDataCourses] = useState(0);
  const [mobileCourses, setMobileCourses] = useState(0);
  const [uiuxCourses, setUiuxCourses] = useState(0);
  const [businessCourses, setBusinessCourses] = useState(0);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Fetch real courses from API
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        const data = await response.json();
        // Ensure data is an array
        setFeaturedCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Fallback to DSA course only
        setFeaturedCourses([{
          _id: '691f2a5939d894f3099a1dfa',
          title: 'Data Structures & Algorithms Mastery',
          instructor: { name: 'DoFlow Academy' },
          ratings: { average: 4.9 },
          enrollmentCount: 0,
          price: 0,
          discountPrice: 0,
          thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
          level: 'Beginner',
          totalLessons: 15,
        }]);
      }
    };
    
    fetchCourses();
    
    // Counter animation for stats
    const animateCounter = (target: number, setter: (value: number) => void, duration: number = 2000, suffix: string = '') => {
      const start = 0;
      const increment = target / (duration / 16); // 60fps
      let current = start;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
    };

    // Start animations after component mounts
    setTimeout(() => {
      animateCounter(2500, setActiveStudents);
      animateCounter(25, setVideoCourses);
      animateCounter(8, setExpertInstructors);
      animateCounter(92, setSuccessRate);
      
      // Category counters
      animateCounter(3, setDsaCourses, 1500);
      animateCounter(8, setWebCourses, 1500);
      animateCounter(5, setDataCourses, 1500);
      animateCounter(4, setMobileCourses, 1500);
      animateCounter(3, setUiuxCourses, 1500);
      animateCounter(2, setBusinessCourses, 1500);
    }, 300);
  }, []);

  const stats = [
    { icon: <FiUsers />, value: `${(activeStudents / 1000).toFixed(1)}K+`, label: 'Active Students' },
    { icon: <FiPlay />, value: `${videoCourses}+`, label: 'Video Courses' },
    { icon: <FiAward />, value: `${expertInstructors}+`, label: 'Expert Instructors' },
    { icon: <FiTrendingUp />, value: `${successRate}%`, label: 'Success Rate' },
  ];

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
    { name: 'DSA & Coding', count: dsaCourses, icon: <FiCode className="w-6 h-6" /> },
    { name: 'Web Development', count: webCourses, icon: <FiMonitor className="w-6 h-6" /> },
    { name: 'Data Science', count: dataCourses, icon: <FiBarChart2 className="w-6 h-6" /> },
    { name: 'Mobile Development', count: mobileCourses, icon: <FiSmartphone className="w-6 h-6" /> },
    { name: 'UI/UX Design', count: uiuxCourses, icon: <FiLayout className="w-6 h-6" /> },
    { name: 'Business', count: businessCourses, icon: <FiBriefcase className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 touch-action-manipulation">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-40 md:pb-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 mb-6 md:mb-8 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full transition-colors duration-300">
            <span className="text-xs md:text-sm font-medium text-brand-primary">✨ #1 Online Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 text-light-text dark:text-dark-text tracking-tight leading-tight transition-colors duration-300">
            Master Skills with
            <br />
            <span className="text-brand-primary">DoFlow</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-light-textSecondary dark:text-dark-muted mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-4 transition-colors duration-300">
            Learn from industry experts and transform your career with our premium courses in development, design, business, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-12 md:mb-20 px-4">
            <button
              onClick={() => window.location.hash = '/courses'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-base md:text-lg"
            >
              <FiPlay className="w-5 h-5" />
              Explore Courses
            </button>
            <button
              onClick={() => window.location.hash = isAuthenticated ? '/dashboard' : '/auth'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-light-card dark:bg-dark-card hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt text-light-text dark:text-dark-text font-semibold rounded-xl border-2 border-light-border dark:border-dark-border transition-all duration-200 active:scale-95 text-base md:text-lg"
            >
              {isAuthenticated ? 'My Dashboard' : 'Start Free Trial'}
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto px-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-5 md:p-6 text-center shadow-sm hover:shadow-md hover:border-brand-primary transition-all duration-300 active:scale-95"
              >
                <div className="text-brand-primary text-2xl md:text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-1 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-light-textMuted dark:text-dark-muted transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full transition-colors duration-300">
              <span className="text-sm font-medium text-light-textMuted dark:text-dark-muted transition-colors duration-300">Why Choose Us</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4 transition-colors duration-300">
              Learn Smarter, Not Harder
            </h2>
            <p className="text-lg text-light-textSecondary dark:text-dark-muted max-w-2xl mx-auto transition-colors duration-300">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 md:p-8 hover:border-brand-primary hover:shadow-md transition-all duration-300 group active:scale-95"
              >
                <div className="w-14 h-14 md:w-12 md:h-12 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 dark:group-hover:bg-brand-primary/30 transition-colors duration-300">
                  <div className="text-brand-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-light-textSecondary dark:text-dark-muted text-sm leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-light-cardAlt dark:bg-dark-cardAlt transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full transition-colors duration-300">
              <span className="text-sm font-medium text-light-textMuted dark:text-dark-muted transition-colors duration-300">Popular Categories</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4 transition-colors duration-300">
              Explore by Category
            </h2>
            <p className="text-lg text-light-textSecondary dark:text-dark-muted max-w-2xl mx-auto transition-colors duration-300">
              Find the perfect course for your goals
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = `/courses?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-5 md:p-6 text-center hover:border-brand-primary hover:shadow-sm transition-all duration-300 group active:scale-95"
              >
                <div className="flex items-center justify-center mb-3 text-brand-primary group-hover:text-brand-primaryHover transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-xs text-light-textMuted dark:text-dark-muted transition-colors duration-300">
                  {category.count} {category.count === 1 ? 'Course' : 'Courses'}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                <span className="text-sm font-medium text-brand-gold">Featured Courses</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text transition-colors duration-300">
                Most Popular Courses
              </h2>
            </div>
            <button
              onClick={() => window.location.hash = '/courses'}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-light-card dark:bg-dark-card hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt text-light-text dark:text-dark-text font-medium rounded-lg border border-light-border dark:border-dark-border transition-all duration-300"
            >
              View All
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredCourses.map((course) => (
              <button
                key={course._id}
                onClick={() => {
                  // Redirect to DSA landing page for DSA course, otherwise to generic course details
                  if (course._id === '691f2a5939d894f3099a1dfa') {
                    window.location.hash = '/dsa-course';
                  } else {
                    window.location.hash = `/course/${course._id}`;
                  }
                }}
                className="bg-light-card border border-light-border dark:bg-dark-card dark:border-dark-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-md transition-all duration-300 group text-left active:scale-95"
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
                  <p className="text-sm text-light-textSecondary mb-4">
                    by {typeof course.instructor === 'object' ? course.instructor.name : 'DoFlow Academy'}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-xs text-light-textMuted">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-brand-accent w-3.5 h-3.5" />
                      <span className="font-semibold text-light-text">{course.ratings?.average || 4.9}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUsers className="w-3.5 h-3.5" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{course.totalLessons || 0} lessons</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-light-border">
                    <div>
                      {(course.discountPrice || course.price) === 0 ? (
                        <span className="text-2xl font-bold text-brand-accent">
                          FREE
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-brand-primary">
                            ₹{course.discountPrice || course.price}
                          </span>
                          {course.discountPrice && course.price > course.discountPrice && (
                            <span className="text-sm text-light-textMuted line-through">
                              ₹{course.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center group-hover:bg-brand-primaryHover transition-colors">
                      <FiArrowRight className="text-white w-4 h-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-6 md:mt-8 md:hidden px-4">
            <button
              onClick={() => window.location.hash = '/courses'}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-base"
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