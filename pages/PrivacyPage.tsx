import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const PrivacyPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="Privacy Policy"
    title="We keep your data handled with care"
    description="This page explains the kinds of data we collect, how it is used, and the controls we use to keep your information protected."
    highlights={[
      'Account and usage data',
      'Payment and access records',
      'Security and platform analytics',
      'Limited sharing for service delivery',
    ]}
    sections={[
      {
        title: 'How we use data',
        body: 'We use data to deliver course access, support your learning journey, keep accounts secure, and improve the product experience.',
      },
      {
        title: 'Your controls',
        body: 'You can manage account details, reset passwords, and contact support if you need help understanding or updating your data preferences.',
      },
    ]}
    stats={[
      { label: 'Focus', value: 'Security' },
      { label: 'Use', value: 'Service' },
      { label: 'Sharing', value: 'Limited' },
      { label: 'Trust', value: 'Primary' },
    ]}
    ctaLabel="Explore Courses"
    ctaHref="/#/courses"
  />
);

export default PrivacyPage;
