import React from 'react';

const TermsConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-8">
          Terms and Conditions
        </h1>
        
        <div className="prose prose-lg max-w-none text-light-textSecondary dark:text-dark-muted space-y-6">
          <p className="text-sm text-light-textMuted dark:text-dark-muted">
            Last Updated: November 19, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">1. Acceptance of Terms</h2>
            <p>
              By accessing and using DoFlow, you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">2. Use License</h2>
            <p>Permission is granted to access and use our educational content for personal, non-commercial use. This license includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to enrolled courses and materials</li>
              <li>Personal learning and skill development</li>
              <li>Certificate upon course completion</li>
            </ul>
            <p className="mt-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Redistribute or sell course content</li>
              <li>Share your account credentials</li>
              <li>Copy or duplicate course materials</li>
              <li>Use content for commercial purposes without permission</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">3. User Account</h2>
            <p>When you create an account with us, you must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your password</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">4. Course Access and Enrollment</h2>
            <p>
              Upon successful payment, you will receive lifetime access to enrolled courses unless otherwise specified. 
              We reserve the right to modify course content, pricing, and availability at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">5. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All payments are processed securely through Razorpay</li>
              <li>Prices are in Indian Rupees (INR) unless stated otherwise</li>
              <li>Payment must be made in full before accessing course content</li>
              <li>We accept credit cards, debit cards, UPI, and net banking</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">6. Intellectual Property</h2>
            <p>
              All course content, including videos, text, graphics, logos, and software, is the property of DoFlow 
              and is protected by copyright and intellectual property laws.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">7. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or viruses</li>
              <li>Harass or abuse other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">8. Limitation of Liability</h2>
            <p>
              DoFlow shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes 
              via email or through the platform.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">10. Contact Information</h2>
            <p>For questions about these Terms and Conditions, contact us:</p>
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

export default TermsConditionsPage;
