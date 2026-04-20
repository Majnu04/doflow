import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const TermsPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="Terms of Service"
    title="Clear terms, simple expectations"
    description="Our terms explain how DoFlow works, what users can expect, and how we protect the platform for everyone."
    highlights={[
      'Account usage and eligibility',
      'Course access and content use',
      'Billing, payments, and refunds',
      'Platform rules and limitations',
    ]}
    sections={[
      {
        title: 'User responsibilities',
        body: 'Users should keep account details accurate, protect login credentials, and use the platform in line with applicable laws and our policies.',
      },
      {
        title: 'Content and access',
        body: 'Purchased content is provided for learning access within the platform. Access rules may vary by course type or promotional offer.',
      },
    ]}
    stats={[
      { label: 'Policy areas', value: '4' },
      { label: 'Clarity', value: 'High' },
      { label: 'Access', value: 'Defined' },
      { label: 'Support', value: 'Available' },
    ]}
    ctaLabel="Back to Home"
    ctaHref="/#/"
  />
);

export default TermsPage;
