import React from 'react';
import { FiShield } from 'react-icons/fi';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <FiShield className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-light-text mb-4">Privacy Policy</h1>
          <p className="text-light-textSecondary">Last updated: December 10, 2025</p>
        </div>

        {/* Privacy Content */}
        <div className="max-w-4xl mx-auto bg-light-card rounded-xl p-8 md:p-12 border border-border-subtle">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <p className="text-light-textSecondary leading-relaxed mb-4">
                At DoFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
                and safeguard your information when you use our platform. Please read this policy carefully.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">1. Information We Collect</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password, and profile picture</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we don't store complete card details)</li>
                <li><strong>Course Activity:</strong> Progress, completion status, quiz responses, and certificates earned</li>
                <li><strong>Communications:</strong> Messages, support requests, and feedback you send to us</li>
              </ul>
              <p className="text-light-textSecondary leading-relaxed">
                We also automatically collect certain information when you use our platform:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li><strong>Usage Data:</strong> Pages viewed, courses accessed, time spent, and interaction patterns</li>
                <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
                <li><strong>Cookies:</strong> Small data files stored on your device to enhance your experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">2. How We Use Your Information</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>To provide, maintain, and improve our services</li>
                <li>To process your transactions and send related information</li>
                <li>To send you course updates, newsletters, and promotional materials (you can opt-out anytime)</li>
                <li>To respond to your comments, questions, and support requests</li>
                <li>To monitor and analyze usage patterns to enhance user experience</li>
                <li>To detect, prevent, and address technical issues and security threats</li>
                <li>To personalize your learning experience and recommend relevant courses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">3. Information Sharing and Disclosure</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li><strong>With Instructors:</strong> Course progress and completion data may be shared with course instructors</li>
                <li><strong>Service Providers:</strong> Third-party companies that help us operate (e.g., Razorpay for payments)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or transfer of our business</li>
              </ul>
              <p className="text-light-textSecondary leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">4. Data Security</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Secure payment processing through PCI DSS compliant providers</li>
              </ul>
              <p className="text-light-textSecondary leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">5. Your Rights and Choices</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct your account information at any time</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails using the link in our messages</li>
                <li><strong>Cookie Control:</strong> Manage cookie preferences through your browser settings</li>
              </ul>
              <p className="text-light-textSecondary leading-relaxed mt-4">
                To exercise these rights, please contact us at doflow004@gmail.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">6. Third-Party Services</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                Our platform uses third-party services that have their own privacy policies:
              </p>
              <ul className="list-disc pl-6 text-light-textSecondary space-y-2">
                <li><strong>Razorpay:</strong> For secure payment processing</li>
                <li><strong>Analytics Services:</strong> To understand how users interact with our platform</li>
              </ul>
              <p className="text-light-textSecondary leading-relaxed mt-4">
                We encourage you to review the privacy policies of these third-party services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">7. Children's Privacy</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                Our services are not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">8. Data Retention</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We retain your personal information for as long as necessary to provide our services and fulfill 
                the purposes outlined in this policy. When you delete your account, we will delete or anonymize 
                your personal information, except where we are required to retain it for legal or legitimate 
                business purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">9. International Data Transfers</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                Your information may be transferred to and maintained on servers located outside of your country. 
                We ensure appropriate safeguards are in place to protect your information in accordance with this 
                Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-light-text mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new policy on this page and updating the "Last updated" date. Significant changes will be 
                communicated via email or a prominent notice on our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-light-text mb-4">11. Contact Us</h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-neutral-sand p-6 rounded-lg">
                <p className="text-light-text mb-2"><strong>Email:</strong> doflow004@gmail.com</p>
                <p className="text-light-text"><strong>Phone:</strong> +91 7893804498</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
