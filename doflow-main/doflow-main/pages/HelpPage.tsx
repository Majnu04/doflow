import React from 'react';
import { FiHelpCircle, FiBookOpen, FiCreditCard, FiSettings, FiMail, FiMessageCircle } from 'react-icons/fi';

const HelpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-light-text mb-6">Help Center</h1>
          <p className="text-xl text-light-textSecondary leading-relaxed">
            Find answers to common questions and get the support you need
          </p>
        </div>

        {/* Help Topics Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-light-card rounded-xl p-8 border border-border-subtle hover:border-brand-primary transition-colors">
              <FiBookOpen className="w-12 h-12 text-brand-primary mb-4" />
              <h3 className="text-2xl font-bold text-light-text mb-3">Getting Started</h3>
              <p className="text-light-textSecondary mb-4">
                Learn how to navigate DoFlow, create your account, and start your learning journey.
              </p>
              <ul className="space-y-2 text-light-textSecondary">
                <li>• Creating your account</li>
                <li>• Browsing courses</li>
                <li>• Enrolling in a course</li>
                <li>• Navigating the learning interface</li>
              </ul>
            </div>

            <div className="bg-light-card rounded-xl p-8 border border-border-subtle hover:border-brand-primary transition-colors">
              <FiHelpCircle className="w-12 h-12 text-brand-primary mb-4" />
              <h3 className="text-2xl font-bold text-light-text mb-3">Course Access</h3>
              <p className="text-light-textSecondary mb-4">
                Information about enrolling, accessing, and completing your courses.
              </p>
              <ul className="space-y-2 text-light-textSecondary">
                <li>• Accessing enrolled courses</li>
                <li>• Tracking your progress</li>
                <li>• Downloading certificates</li>
                <li>• Course completion requirements</li>
              </ul>
            </div>

            <div className="bg-light-card rounded-xl p-8 border border-border-subtle hover:border-brand-primary transition-colors">
              <FiCreditCard className="w-12 h-12 text-brand-primary mb-4" />
              <h3 className="text-2xl font-bold text-light-text mb-3">Payments & Refunds</h3>
              <p className="text-light-textSecondary mb-4">
                Questions about pricing, payment methods, and our refund policy.
              </p>
              <ul className="space-y-2 text-light-textSecondary">
                <li>• Payment methods accepted</li>
                <li>• Secure payment processing</li>
                <li>• Refund policy (30 days)</li>
                <li>• Billing questions</li>
              </ul>
            </div>

            <div className="bg-light-card rounded-xl p-8 border border-border-subtle hover:border-brand-primary transition-colors">
              <FiSettings className="w-12 h-12 text-brand-primary mb-4" />
              <h3 className="text-2xl font-bold text-light-text mb-3">Technical Support</h3>
              <p className="text-light-textSecondary mb-4">
                Get help with technical issues, platform features, and troubleshooting.
              </p>
              <ul className="space-y-2 text-light-textSecondary">
                <li>• Video playback issues</li>
                <li>• Browser compatibility</li>
                <li>• Mobile app support</li>
                <li>• Account settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Questions */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-light-text mb-8 text-center">Quick Answers</h2>
          <div className="space-y-4">
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="font-bold text-lg text-light-text mb-2">How do I reset my password?</h3>
              <p className="text-light-textSecondary">
                Click on "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.
              </p>
            </div>
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="font-bold text-lg text-light-text mb-2">Can I access courses on mobile?</h3>
              <p className="text-light-textSecondary">
                Yes! DoFlow is fully responsive and works seamlessly on all devices including smartphones and tablets.
              </p>
            </div>
            <div className="bg-light-card rounded-xl p-6 border border-border-subtle">
              <h3 className="font-bold text-lg text-light-text mb-2">How long do I have access to a course?</h3>
              <p className="text-light-textSecondary">
                Once enrolled, you have lifetime access to the course content, including any future updates.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-accentSoft rounded-xl p-12 text-center border border-brand-accent">
            <h2 className="text-3xl font-bold text-light-text mb-4">Still Need Help?</h2>
            <p className="text-lg text-light-textSecondary mb-8">
              Our support team is here to assist you with any questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:doflow004@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors"
              >
                <FiMail className="w-5 h-5" />
                Email Support
              </a>
              <button
                onClick={() => window.location.hash = '/faq'}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-light-card hover:bg-light-cardAlt text-light-text font-medium rounded-lg transition-colors border border-border-subtle"
              >
                <FiMessageCircle className="w-5 h-5" />
                View FAQs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
