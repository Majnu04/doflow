import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const AboutPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="About DoFlow"
    title="Built for focused learning"
    description="DoFlow is a premium learning platform designed to help students build job-ready skills through clear courses, practical exercises, and a calm learning experience."
    highlights={[
      'Structured courses with a practical learning flow',
      'Clear progress tracking and easy navigation',
      'Content designed for students and working professionals',
      'Premium UI built to reduce friction and distraction',
    ]}
    sections={[
      {
        title: 'Our mission',
        body: 'We want learners to spend less time searching and more time learning. Every product decision is made to support clarity, momentum, and outcomes.',
      },
      {
        title: 'Our approach',
        body: 'We combine expert-led content with hands-on practice so learners can understand concepts and apply them confidently in real work.',
      },
    ]}
    stats={[
      { label: 'Courses', value: '500+' },
      { label: 'Students', value: '50K+' },
      { label: 'Instructors', value: '100+' },
      { label: 'Learning paths', value: '12' },
    ]}
  />
);

export default AboutPage;
