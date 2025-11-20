import React from 'react';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Blog
        </h1>
        <p className="text-lg text-light-textSecondary dark:text-dark-muted mb-12">
          Latest articles, tips, and insights from our team
        </p>
        
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Coming Soon
          </h2>
          <p className="text-light-textSecondary dark:text-dark-muted mb-8">
            We're working on bringing you amazing content. Check back soon!
          </p>
          <a
            href="/#/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200"
          >
            Explore Courses
            <FiArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;