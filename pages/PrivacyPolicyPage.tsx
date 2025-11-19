import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-light-textSecondary dark:text-dark-muted space-y-6">
          <p className="text-sm text-light-textMuted dark:text-dark-muted">
            Last Updated: November 19, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account on DoFlow</li>
              <li>Enroll in courses</li>
              <li>Make purchases</li>
              <li>Contact our support team</li>
              <li>Participate in discussions or forums</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for transaction processing</li>
              <li>Analytics providers to understand usage patterns</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information. However, no method of 
              transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">6. Cookies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
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

export default PrivacyPolicyPage;
