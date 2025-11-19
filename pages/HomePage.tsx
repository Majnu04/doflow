import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { FiPlay, FiUsers, FiAward, FiTrendingUp, FiClock, FiStar, FiArrowRight, FiCode, FiMonitor, FiBarChart2, FiSmartphone, FiLayout, FiBriefcase } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: <FiUsers />, value: '50K+', label: 'Active Students' },
    { icon: <FiPlay />, value: '500+', label: 'Video Courses' },
    { icon: <FiAward />, value: '100+', label: 'Expert Instructors' },
    { icon: <FiTrendingUp />, value: '95%', label: 'Success Rate' },
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
    { name: 'DSA & Coding', count: 1, icon: <FiCode className="w-6 h-6" /> },
    { name: 'Web Development', count: 120, icon: <FiMonitor className="w-6 h-6" /> },
    { name: 'Data Science', count: 85, icon: <FiBarChart2 className="w-6 h-6" /> },
    { name: 'Mobile Development', count: 65, icon: <FiSmartphone className="w-6 h-6" /> },
    { name: 'UI/UX Design', count: 90, icon: <FiLayout className="w-6 h-6" /> },
    { name: 'Business', count: 110, icon: <FiBriefcase className="w-6 h-6" /> },
  ];

  const featuredCourses = [
    {
      id: 'dsa-roadmap',
      title: 'Master Data Structures & Algorithms - Complete Roadmap',
      instructor: 'DoFlow Academy',
      rating: 4.9,
      students: 12500,
      price: 0,
      originalPrice: 0,
      thumbnail: 'https://picsum.photos/seed/dsa/600/400',
      level: 'All Levels',
      duration: '180+ Problems',
      isDSA: true,
    },
    {
      id: '1',
      title: 'Complete Web Development Bootcamp 2024',
      instructor: 'Sarah Johnson',
      rating: 4.9,
      students: 45000,
      price: 49.99,
      originalPrice: 199.99,
      thumbnail: 'https://picsum.photos/seed/web/600/400',
      level: 'Beginner',
      duration: '40 hours',
    },
    {
      id: '2',
      title: 'Advanced React & Next.js Masterclass',
      instructor: 'Michael Chen',
      rating: 4.8,
      students: 32000,
      price: 59.99,
      originalPrice: 249.99,
      thumbnail: 'https://picsum.photos/seed/react/600/400',
      level: 'Advanced',
      duration: '35 hours',
    },
    {
      id: '3',
      title: 'Python for Data Science & Machine Learning',
      instructor: 'Dr. Emily Rodriguez',
      rating: 4.9,
      students: 38000,
      price: 54.99,
      originalPrice: 229.99,
      thumbnail: 'https://picsum.photos/seed/python/600/400',
      level: 'Intermediate',
      duration: '50 hours',
    },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-full transition-colors duration-300">
            <span className="text-sm font-medium text-brand-primary">✨ #1 Online Learning Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-light-text dark:text-dark-text tracking-tight transition-colors duration-300">
            Master Skills with
            <br />
            <span className="text-brand-primary">DoFlow</span>
          </h1>

          <p className="text-lg md:text-xl text-light-textSecondary dark:text-dark-muted mb-10 max-w-2xl mx-auto transition-colors duration-300">
            Learn from industry experts and transform your career with our premium courses in development, design, business, and more.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => window.location.hash = '/courses'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <FiPlay className="w-4 h-4" />
              Explore Courses
            </button>
            <button
              onClick={() => window.location.hash = isAuthenticated ? '/dashboard' : '/auth'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-light-card dark:bg-dark-card hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt text-light-text dark:text-dark-text font-medium rounded-lg border border-light-border dark:border-dark-border transition-all duration-300"
            >
              {isAuthenticated ? 'My Dashboard' : 'Start Free Trial'}
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="text-brand-primary text-3xl mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-1 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-sm text-light-textMuted dark:text-dark-muted transition-colors duration-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 hover:border-brand-primary hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 dark:group-hover:bg-brand-primary/30 transition-colors duration-300">
                  <div className="text-brand-primary">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2 transition-colors duration-300">
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
      <section className="py-20 md:py-32 bg-light-cardAlt dark:bg-dark-cardAlt transition-colors duration-300">
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.hash = `/courses?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 text-center hover:border-brand-primary hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-center justify-center mb-3 text-brand-primary group-hover:text-brand-primaryHover transition-colors duration-300">
                  {category.icon}
                </div>
                <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1 transition-colors duration-300">
                  {category.name}
                </h3>
                <p className="text-xs text-light-textMuted dark:text-dark-muted transition-colors duration-300">
                  {category.count} Courses
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 md:py-32 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => window.location.hash = course.isDSA ? '/dsa-course' : `/course/${course.id}`}
                className="bg-light-card border border-light-border rounded-xl overflow-hidden hover:border-brand-primary hover:shadow-md transition-all group text-left"
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
                  <p className="text-sm text-light-textSecondary mb-4">by {course.instructor}</p>

                  <div className="flex items-center gap-4 mb-4 text-xs text-light-textMuted">
                    <div className="flex items-center gap-1">
                      <FiStar className="text-brand-accent w-3.5 h-3.5" />
                      <span className="font-semibold text-light-text">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUsers className="w-3.5 h-3.5" />
                      <span>{(course.students / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-light-border">
                    <div>
                      {course.price === 0 ? (
                        <span className="text-2xl font-bold text-brand-accent">
                          FREE
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-brand-primary">
                            ${course.price}
                          </span>
                          <span className="text-sm text-light-textMuted line-through">
                            ${course.originalPrice}
                          </span>
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

          <div className="text-center mt-8 md:hidden">
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

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-light-cardAlt">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-primary rounded-2xl p-12 md:p-16 text-center shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Join thousands of students already learning on DoFlow
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.location.hash = isAuthenticated ? '/courses' : '/auth'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-brand-primary font-medium rounded-lg transition-colors shadow-sm"
              >
                <FiPlay className="w-4 h-4" />
                Get Started Now
              </button>
              <button
                onClick={() => window.location.hash = '/about'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg border border-white/30 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;