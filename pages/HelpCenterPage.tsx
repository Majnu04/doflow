import React from 'react';
import { FiMail, FiPhone, FiMessageCircle, FiBook } from 'react-icons/fi';

const HelpCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Help Center
        </h1>
        <p className="text-lg text-light-textSecondary dark:text-dark-muted mb-12">
          We're here to help you with any questions or issues
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <a href="mailto:doflow004@gmail.com" className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border hover:border-brand-primary transition-all duration-300">
            <FiMail className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Email Support</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted mb-2">doflow004@gmail.com</p>
            <p className="text-xs text-light-textMuted dark:text-dark-muted">Response within 24 hours</p>
          </a>
          <a href="tel:+917893804498" className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border hover:border-brand-primary transition-all duration-300">
            <FiPhone className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Phone Support</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted mb-2">+91 7893804498</p>
            <p className="text-xs text-light-textMuted dark:text-dark-muted">Available during business hours</p>
          </a>
          <a href="/#/faq" className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border hover:border-brand-primary transition-all duration-300">
            <FiBook className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">FAQs</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted mb-2">Frequently Asked Questions</p>
            <p className="text-xs text-light-textMuted dark:text-dark-muted">Find quick answers</p>
          </a>
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border">
            <FiMessageCircle className="w-8 h-8 text-brand-primary mb-4" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-2">Live Chat</h3>
            <p className="text-sm text-light-textSecondary dark:text-dark-muted mb-2">Coming Soon</p>
            <p className="text-xs text-light-textMuted dark:text-dark-muted">Chat with our support team</p>
          </div>
        </div>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Common Issues
          </h2>
          <ul className="space-y-3 text-light-textSecondary dark:text-dark-muted">
            <li>• Having trouble accessing a course? Check your enrollment status</li>
            <li>• Payment issues? Contact us with your transaction details</li>
            <li>• Technical problems? Try clearing your browser cache</li>
            <li>• Need a refund? Review our <a href="/#/refund-policy" className="text-brand-primary hover:underline">refund policy</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;