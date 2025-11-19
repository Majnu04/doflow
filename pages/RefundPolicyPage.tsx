import React from 'react';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-8">
          Cancellation and Refund Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-light-textSecondary dark:text-dark-muted space-y-6">
          <p className="text-sm text-light-textMuted dark:text-dark-muted">
            Last Updated: November 19, 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">1. Refund Eligibility</h2>
            <p>
              We offer a 7-day money-back guarantee on all course purchases. You are eligible for a full refund if:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You request a refund within 7 days of purchase</li>
              <li>You have completed less than 30% of the course content</li>
              <li>The course content is significantly different from what was advertised</li>
              <li>You experience technical issues that prevent course access (and we cannot resolve them)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">2. Non-Refundable Situations</h2>
            <p>Refunds will NOT be provided in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>More than 7 days have passed since purchase</li>
              <li>You have completed more than 30% of the course</li>
              <li>You have downloaded course materials or certificates</li>
              <li>You purchased during a special promotion or sale</li>
              <li>The course was marked as "non-refundable" at time of purchase</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">3. How to Request a Refund</h2>
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email us at doflow004@gmail.com with your order details</li>
              <li>Include your registered email address and order number</li>
              <li>Provide a brief reason for the refund request</li>
              <li>Allow 5-7 business days for processing</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">4. Refund Processing</h2>
            <p>Once your refund request is approved:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refund will be initiated within 5-7 business days</li>
              <li>Money will be credited to your original payment method</li>
              <li>Bank processing may take additional 5-10 business days</li>
              <li>You will receive a confirmation email once processed</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">5. Course Access After Refund</h2>
            <p>
              Upon approval of a refund, your access to the course will be immediately revoked. You will no longer 
              be able to access course materials, videos, or any downloadable content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">6. Cancellation Policy</h2>
            <p>
              You can cancel your enrollment at any time within the 7-day window. After 7 days, cancellations 
              are not eligible for refunds but you will retain lifetime access to the course.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">7. Bundle Purchases</h2>
            <p>
              For courses purchased as part of a bundle or subscription:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds apply to the entire bundle, not individual courses</li>
              <li>The 7-day period starts from the bundle purchase date</li>
              <li>30% completion rule applies to the entire bundle</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">8. Technical Issues</h2>
            <p>
              If you experience technical problems accessing course content, please contact our support team 
              before requesting a refund. We will make every effort to resolve the issue.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">9. Contact Us</h2>
            <p>For refund requests or questions about this policy:</p>
            <ul className="list-none space-y-2">
              <li>Email: doflow004@gmail.com</li>
              <li>Phone: +91 7893804498</li>
              <li>Response Time: Within 24-48 hours</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
