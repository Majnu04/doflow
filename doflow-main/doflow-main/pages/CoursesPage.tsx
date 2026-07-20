import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../src/store/slices/coursesSlice';
import { AppDispatch, RootState } from '../src/store';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import { CourseGridSkeleton, EmptyState, ErrorState } from '../src/components/common/StateIndicators';
import { Button } from '../src/components/ui';

const COURSE_PLACEHOLDER = '/images/course-placeholder.svg';

const CoursesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, isLoading, error } = useSelector((state: RootState) => state.courses);
  const [filters, setFilters] = React.useState({
    category: '',
    level: '',
    search: '',
    sort: 'newest'
  });

  useEffect(() => {
    dispatch(getCourses(filters));
  }, [dispatch, filters]);

  const handleRetry = () => {
    dispatch(getCourses(filters));
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      level: '',
      search: '',
      sort: 'newest'
    });
  };

  const categories = ['DSA & Coding', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'AI', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design', 'Digital Marketing'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  const renderContent = () => {
    if (isLoading) {
      return <CourseGridSkeleton />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={handleRetry} />;
    }

    const filteredCourses = courses.filter(course => {
        if (filters.category && course.category !== filters.category) return false;
        if (filters.level && course.level !== filters.level) return false;
        if (filters.search && !course.title.toLowerCase().includes(filters.search.toLowerCase()) && !(course.shortDescription || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    if (filteredCourses.length === 0) {
      return (
        <EmptyState
          title="No Courses Found"
          message="We couldn't find any courses matching your filters. Try adjusting your search."
          action={
            <Button onClick={handleClearFilters} variant="primary">
              Clear Filters
            </Button>
          }
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => {
          const ratingValue = course.ratings?.average ?? (course as any).rating ?? 0;
          const enrollmentValue = course.enrollmentCount ?? 0;
          const durationLabel = course.isDSA ? (course.estimatedDuration || 'DSA Roadmap') : `${Math.floor((course.totalDuration || 0) / 60)}h`;
          const discountPrice = course.discountPrice ?? 0;
          const priceLabel = course.price ?? 0;
          const courseLink = course.isDSA && course._id
            ? `/#/dsa/problems/${course._id}`
            : `/#/course/${course._id}`;

          return (
          <a
            key={course._id}
            href={courseLink}
            className={`bg-light-card border border-border-subtle rounded-2xl p-5 hover:border-brand-primary hover:shadow-lg transition-all duration-300 ${course.isDSA ? 'border-brand-primary shadow-md' : ''}`}
          >
            <div className="relative">
              <img
                src={course.thumbnail || COURSE_PLACEHOLDER}
                alt={course.title}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <div className="absolute top-3 right-3 bg-white/80 text-brand-primary px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide">
                {course.level}
              </div>
              {course.isDSA && (
                <div className="absolute top-3 left-3 bg-brand-primary text-white px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wide">
                  Featured
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold mb-2 line-clamp-2 text-light-text">{course.title}</h3>
            <p className="text-light-textSecondary text-sm mb-4 line-clamp-2">{course.shortDescription}</p>

            <div className="flex items-center gap-4 text-xs text-light-textMuted mb-4">
              <div className="flex items-center gap-1">
                <FaStar className="text-brand-accent" />
                <span>{Number(ratingValue).toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaUsers />
                <span>{enrollmentValue.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaClock />
                <span>{durationLabel}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {discountPrice ? (
                  <>
                    <span className="text-xl font-semibold text-brand-primary">₹{discountPrice}</span>
                    <span className="text-light-textMuted line-through ml-2">₹{priceLabel}</span>
                  </>
                ) : priceLabel > 0 ? (
                  <span className="text-xl font-semibold text-brand-primary">₹{priceLabel}</span>
                ) : (
                  <span className="text-xl font-semibold text-brand-accent">Free</span>
                )}
              </div>
            </div>
          </a>
        );})}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-32 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-light-text mb-3">Explore Our Courses</h1>
          <p className="text-light-textSecondary text-lg max-w-2xl mx-auto">Discover your next learning adventure from our curated collection of expert-led courses.</p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-5 bg-light-card border border-border-subtle rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2.5 bg-light-bg border border-border-subtle rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition"
          />

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2.5 bg-light-bg border border-border-subtle rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-4 py-2.5 bg-light-bg border border-border-subtle rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-2.5 bg-light-bg border border-border-subtle rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none transition"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Courses Grid */}
        {renderContent()}
      </div>
    </div>
  );
};

export default CoursesPage;
