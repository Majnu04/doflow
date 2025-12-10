import React from 'react';
import { FiBook, FiTrendingUp, FiCode, FiClock } from 'react-icons/fi';

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-light-text mb-6">DoFlow Blog</h1>
          <p className="text-xl text-light-textSecondary leading-relaxed">
            Stay updated with tips, tutorials, and industry insights to accelerate your learning journey
          </p>
        </div>

        {/* Coming Soon Message */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-brand-accentSoft rounded-xl p-12 text-center border border-brand-accent">
            <FiBook className="w-16 h-16 text-brand-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-light-text mb-4">Blog Coming Soon!</h2>
            <p className="text-lg text-light-textSecondary mb-8">
              We're working on creating valuable content about learning, career development, and technology trends. 
              Stay tuned for insightful articles, tutorials, and success stories from our community.
            </p>
            <button
              onClick={() => window.location.hash = '/courses'}
              className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors"
            >
              Explore Courses Instead
            </button>
          </div>
        </div>

        {/* Topics Preview */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">Topics We'll Cover</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <FiCode className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-bold text-light-text mb-3">Tutorials & Guides</h3>
              <p className="text-light-textSecondary">
                Step-by-step tutorials on programming, design, and professional skills.
              </p>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <FiTrendingUp className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-bold text-light-text mb-3">Career Advice</h3>
              <p className="text-light-textSecondary">
                Tips for advancing your career, landing jobs, and growing professionally.
              </p>
            </div>

            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <FiClock className="w-10 h-10 text-brand-primary mb-4" />
              <h3 className="text-xl font-bold text-light-text mb-3">Industry Trends</h3>
              <p className="text-light-textSecondary">
                Latest trends in technology, business, and the future of online learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
