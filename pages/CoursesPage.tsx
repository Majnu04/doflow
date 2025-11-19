import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../src/store/slices/coursesSlice';
import { AppDispatch, RootState } from '../src/store';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';

const CoursesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, isLoading } = useSelector((state: RootState) => state.courses);
  const [filters, setFilters] = React.useState({
    category: '',
    level: '',
    search: '',
    sort: 'newest'
  });

  const dsaCourse = {
    _id: 'dsa-roadmap',
    title: 'Master Data Structures & Algorithms - Complete Roadmap',
    shortDescription: 'Complete DSA roadmap with 180+ problems across 4 difficulty levels. Interactive code editor, test cases, and progress tracking.',
    thumbnail: 'https://picsum.photos/seed/dsa/600/400',
    level: 'All Levels',
    ratings: { average: 4.9 },
    enrollmentCount: 12500,
    totalDuration: 0,
    price: 0,
    discountPrice: 0,
    isDSA: true,
    category: 'DSA & Coding'
  };

  useEffect(() => {
    dispatch(getCourses(filters));
  }, [dispatch, filters]);

  const categories = ['DSA & Coding', 'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'AI', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design', 'Digital Marketing'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  return (
    <div className="min-h-screen py-12 px-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-4 transition-colors duration-300">Explore Courses</h1>
          <p className="text-light-textSecondary dark:text-dark-muted text-lg transition-colors duration-300">Discover your next learning adventure</p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-colors duration-300"
          />

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-colors duration-300"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-colors duration-300"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-colors duration-300"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4 animate-pulse transition-colors duration-300">
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-48 rounded-lg mb-4 transition-colors duration-300"></div>
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-6 rounded mb-2 transition-colors duration-300"></div>
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-4 rounded transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* DSA Course Card - Always show if it matches filters */}
            {(!filters.category || filters.category === 'DSA & Coding') &&
             (!filters.level || filters.level === 'All Levels') &&
             (!filters.search || dsaCourse.title.toLowerCase().includes(filters.search.toLowerCase()) || dsaCourse.shortDescription.toLowerCase().includes(filters.search.toLowerCase())) && (
              <a
                href="/#/dsa-course"
                className="bg-light-card dark:bg-dark-card border-2 border-brand-primary rounded-lg p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={dsaCourse.thumbnail}
                    alt={dsaCourse.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute top-2 right-2 bg-brand-gold text-white px-3 py-1 rounded-full font-semibold text-sm">
                    {dsaCourse.level}
                  </div>
                  <div className="absolute top-2 left-2 bg-brand-primary text-white px-3 py-1 rounded-full font-semibold text-sm">
                    NEW
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2 text-light-text dark:text-dark-text transition-colors duration-300">{dsaCourse.title}</h3>
                <p className="text-light-textSecondary dark:text-dark-muted text-sm mb-4 line-clamp-2 transition-colors duration-300">{dsaCourse.shortDescription}</p>

                <div className="flex items-center gap-4 text-sm text-light-textMuted dark:text-dark-muted mb-4 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-brand-accent" />
                    <span>{dsaCourse.ratings.average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>{dsaCourse.enrollmentCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>180+ Problems</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-brand-accent">FREE</span>
                  </div>
                </div>
              </a>
            )}
            
            {courses.map(course => (
              <a
                key={course._id}
                href={`/#/course/${course._id}`}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4 hover:border-brand-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute top-2 right-2 bg-brand-accent text-white px-3 py-1 rounded-full font-semibold text-sm">
                    {course.level}
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 line-clamp-2 text-light-text dark:text-dark-text transition-colors duration-300">{course.title}</h3>
                <p className="text-light-textSecondary dark:text-dark-muted text-sm mb-4 line-clamp-2 transition-colors duration-300">{course.shortDescription}</p>

                <div className="flex items-center gap-4 text-sm text-light-textMuted dark:text-dark-muted mb-4 transition-colors duration-300">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-brand-accent" />
                    <span>{course.ratings.average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUsers />
                    <span>{course.enrollmentCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{Math.floor(course.totalDuration / 60)}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    {course.discountPrice ? (
                      <>
                        <span className="text-2xl font-bold text-brand-primary">₹{course.discountPrice}</span>
                        <span className="text-light-textMuted dark:text-dark-muted line-through ml-2 transition-colors duration-300">₹{course.price}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-brand-primary">₹{course.price}</span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {!isLoading && courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-light-textSecondary dark:text-dark-muted text-lg transition-colors duration-300">No courses found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
