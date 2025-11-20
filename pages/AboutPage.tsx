import React from 'react';
import { FiTarget, FiUsers, FiAward, FiHeart } from 'react-icons/fi';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-8">
          About DoFlow
        </h1>
        
        <div className="prose prose-lg max-w-none text-light-textSecondary dark:text-dark-muted space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Our Mission</h2>
            <p>
              DoFlow is dedicated to empowering learners worldwide with premium online courses. We believe that 
              quality education should be accessible to everyone, anywhere, at any time.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
              <FiTarget className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Our Vision</h3>
              <p className="text-sm">To become the leading platform for skill development and career transformation.</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
              <FiUsers className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Our Community</h3>
              <p className="text-sm">Join thousands of students learning and growing together.</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
              <FiAward className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Quality Content</h3>
              <p className="text-sm">Expert-created courses with industry-recognized certifications.</p>
            </div>
            <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
              <FiHeart className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Student Success</h3>
              <p className="text-sm">Your success is our success. We're here to support you every step of the way.</p>
            </div>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">What We Offer</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>High-quality video courses from industry experts</li>
              <li>Lifetime access to all course materials</li>
              <li>Industry-recognized certificates</li>
              <li>24/7 expert support</li>
              <li>Interactive learning experience</li>
              <li>Regular content updates</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Contact Us</h2>
            <p>Have questions? We'd love to hear from you:</p>
            <ul className="list-none space-y-2">
              <li>Email: doflow004@gmail.com</li>
              <li>Phone: +91 7893804498</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
