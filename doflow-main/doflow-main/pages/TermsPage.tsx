import React from 'react';
import { FiFileText } from 'react-icons/fi';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <FiFileText className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-light-text mb-4">Terms of Service</h1>
          <p className="text-light-textSecondary">Last updated: December 10, 2025</p>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto bg-light-card rounded-xl p-8 md:p-12 border border-border-subtle">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">1. Acceptance of Terms</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                By accessing and using DoFlow ("the Platform"), you accept and agree to be bound by the terms and 
                provisions of this agreement. If you do not agree to these Terms of Service, please do not use the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">2. Description of Service</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                DoFlow provides an online learning platform offering courses, educational content, and related services. 
                We reserve the right to modify, suspend, or discontinue any part of the service at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">3. User Accounts</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                To access certain features of the Platform, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information is accurate and up-to-date</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">4. Course Enrollment and Access</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                Upon enrollment in a course, you receive a limited, non-exclusive, non-transferable license to access 
                the course content for personal, non-commercial use only. Course access is:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>For your personal use only and cannot be shared with others</li>
                <li>Subject to course availability and instructor discretion</li>
                <li>Typically available for lifetime access unless otherwise specified</li>
                <li>Revocable in case of violation of these terms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">5. Payment and Refunds</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                Course prices are listed on the Platform and may change at any time. We offer a 30-day money-back 
                guarantee for most courses. Refund requests must be submitted within 30 days of purchase through 
                our support channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">6. Intellectual Property</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                All content on the Platform, including courses, videos, text, graphics, and logos, is protected by 
                copyright and intellectual property laws. You may not:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>Reproduce, distribute, or create derivative works from course content</li>
                <li>Share your account credentials or course access with others</li>
                <li>Download or record course content (except where explicitly permitted)</li>
                <li>Use content for commercial purposes without authorization</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">7. User Conduct</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                You agree not to use the Platform to:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Harass, abuse, or harm other users or instructors</li>
                <li>Post spam, malicious code, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the Platform or other users' accounts</li>
                <li>Interfere with the proper functioning of the Platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">8. Disclaimers</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                The Platform and all content are provided "as is" without warranties of any kind. We do not guarantee:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>Uninterrupted or error-free service</li>
                <li>Specific learning outcomes or career results</li>
                <li>The accuracy or completeness of course content</li>
                <li>That the Platform will meet your specific requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">9. Limitation of Liability</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                To the maximum extent permitted by law, DoFlow shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages resulting from your use of the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">10. Changes to Terms</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately 
                upon posting to the Platform. Your continued use of the Platform after changes constitutes acceptance 
                of the updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">11. Termination</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Platform at our sole discretion, without 
                prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, 
                us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-light-text mb-4">12. Contact Information</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-neutral-sand p-6 rounded-lg">
                <p className="text-light-text"><strong>Email:</strong> doflow004@gmail.com</p>
                <p className="text-light-text"><strong>Phone:</strong> +91 7893804498</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
