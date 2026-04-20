import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const FaqPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="FAQs"
    title="Frequently asked questions"
    description="A quick reference for the most common questions about using DoFlow, enrolling in courses, and managing your account."
    highlights={[
      'How course access works',
      'How to reset your password',
      'How payments and refunds are handled',
      'How to use your dashboard effectively',
    ]}
    sections={[
      {
        title: 'Where do I start?',
        body: 'Create an account, explore the course catalog, and open any course you want to learn. Your dashboard keeps track of progress and access.',
      },
      {
        title: 'Can I access courses on mobile?',
        body: 'Yes. The experience is responsive and built to work across desktop and mobile devices.',
      },
    ]}
    stats={[
      { label: 'Answered', value: 'Most' },
      { label: 'Topics', value: '12' },
      { label: 'Mobile ready', value: 'Yes' },
      { label: 'Self-serve', value: 'Fast' },
    ]}
    ctaLabel="Contact Support"
    ctaHref="mailto:support@doflow.com"
  />
);

export default FaqPage;
