import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCourses } from '../src/store/slices/coursesSlice';
import { AppDispatch, RootState } from '../src/store';
import { FaStar, FaUsers, FaClock } from 'react-icons/fa';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

const CoursesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, isLoading } = useSelector((state: RootState) => state.courses);
  const [showFilters, setShowFilters] = React.useState(false);
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
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-light-text dark:text-dark-text mb-3 md:mb-4 transition-colors duration-300">Explore Courses</h1>
          <p className="text-light-textSecondary dark:text-dark-muted text-base md:text-lg transition-colors duration-300">Discover your next learning adventure</p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full mb-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text font-semibold transition-all duration-200 active:scale-95"
        >
          {showFilters ? <FiX className="w-5 h-5" /> : <FiFilter className="w-5 h-5" />}
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Filters */}
        <div className={`mb-6 md:mb-8 ${
          showFilters ? 'block' : 'hidden md:block'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-light-textMuted dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 md:py-3 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text placeholder:text-light-textMuted dark:placeholder:text-dark-muted transition-all duration-200"
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full px-4 py-3.5 md:py-3 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value })}
            className="w-full px-4 py-3.5 md:py-3 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full px-4 py-3.5 md:py-3 bg-light-card dark:bg-dark-card border-2 border-light-border dark:border-dark-border rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 focus:outline-none text-light-text dark:text-dark-text transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 animate-pulse transition-colors duration-300">
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-44 md:h-48 rounded-lg mb-4 transition-colors duration-300"></div>
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-6 rounded-lg mb-2 transition-colors duration-300"></div>
                <div className="bg-light-cardAlt dark:bg-dark-cardAlt h-4 rounded-lg transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* DSA Course Card - Always show if it matches filters */}
            {(!filters.category || filters.category === 'DSA & Coding') &&
             (!filters.level || filters.level === 'All Levels') &&
             (!filters.search || dsaCourse.title.toLowerCase().includes(filters.search.toLowerCase()) || dsaCourse.shortDescription.toLowerCase().includes(filters.search.toLowerCase())) && (
              <a
                href="/#/dsa-course"
                className="bg-light-card dark:bg-dark-card border-2 border-brand-primary rounded-xl p-4 md:p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={dsaCourse.thumbnail}
                    alt={dsaCourse.title}
                    className="w-full h-44 md:h-48 object-cover mb-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-brand-gold text-white px-2.5 py-1 md:px-3 md:py-1 rounded-full font-semibold text-xs md:text-sm">
                    {dsaCourse.level}
                  </div>
                  <div className="absolute top-2 left-2 bg-brand-primary text-white px-2.5 py-1 md:px-3 md:py-1 rounded-full font-semibold text-xs md:text-sm">
                    NEW
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 text-light-text dark:text-dark-text group-hover:text-brand-primary transition-colors duration-300">{dsaCourse.title}</h3>
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

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xl md:text-2xl font-bold text-brand-accent">FREE</span>
                  </div>
                </div>
              </a>
            )}
            
            {courses.map(course => (
              <a
                key={course._id}
                href={`/#/course/${course._id}`}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 md:p-5 hover:border-brand-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 group"
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-44 md:h-48 object-cover mb-4 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-brand-accent text-white px-2.5 py-1 md:px-3 md:py-1 rounded-full font-semibold text-xs md:text-sm">
                    {course.level}
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 text-light-text dark:text-dark-text group-hover:text-brand-primary transition-colors duration-300">{course.title}</h3>
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

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {course.discountPrice ? (
                      <>
                        <span className="text-xl md:text-2xl font-bold text-brand-primary">₹{course.discountPrice}</span>
                        <span className="text-sm text-light-textMuted dark:text-dark-muted line-through ml-2 transition-colors duration-300">₹{course.price}</span>
                      </>
                    ) : (
                      <span className="text-xl md:text-2xl font-bold text-brand-primary">₹{course.price}</span>
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
