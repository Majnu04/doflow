import React from 'react';
import { FiVideo, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';

const BecomeInstructorPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Become an Instructor
        </h1>
        <p className="text-lg text-light-textSecondary dark:text-dark-muted mb-12">
          Share your knowledge and earn while teaching thousands of students
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
            <FiVideo className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Create Courses</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted">Build and publish courses on topics you're passionate about</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
            <FiDollarSign className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Earn Revenue</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted">Get paid for every student who enrolls in your courses</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
            <FiUsers className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Global Reach</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted">Teach students from around the world</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
            <FiTrendingUp className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Grow Your Brand</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted">Build your reputation as an expert in your field</p>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Interested in Teaching?
          </h2>
          <p className="text-light-textSecondary dark:text-dark-muted mb-6">
            Contact us to learn more about our instructor program and how to get started.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-light-text dark:text-dark-text">
              Email: <a href="mailto:doflow004@gmail.com" className="text-brand-primary hover:underline">doflow004@gmail.com</a>
            </p>
            <p className="text-sm text-light-text dark:text-dark-text">
              Phone: <a href="tel:+917893804498" className="text-brand-primary hover:underline">+91 7893804498</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructorPage;