import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const BecomeInstructorPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="Instructor Program"
    title="Teach on DoFlow and reach serious learners"
    description="Share your expertise with a focused audience. We help instructors create structured content, deliver a professional experience, and build trust with learners."
    highlights={[
      'Create courses with a clean, guided workflow',
      'Reach learners who are actively building skills',
      'Showcase your expertise with a premium profile',
      'Get support for publishing and course setup',
    ]}
    sections={[
      {
        title: 'For experts',
        body: 'If you can explain clearly and teach practically, DoFlow gives you a strong platform to package your knowledge into a polished learning product.',
      },
      {
        title: 'For creators',
        body: 'We want instructors who care about quality. The platform is built to keep your course content organized and easy for learners to follow.',
      },
    ]}
    stats={[
      { label: 'Instructor slots', value: 'Open' },
      { label: 'Course types', value: 'Multiple' },
      { label: 'Publishing support', value: 'Yes' },
      { label: 'Audience', value: 'Learners' },
    ]}
    ctaLabel="View Courses"
    ctaHref="/#/courses"
  />
);

export default BecomeInstructorPage;
