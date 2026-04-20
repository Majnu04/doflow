import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const BlogPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="DoFlow Blog"
    title="Learning notes, product updates, and practical guides"
    description="Read articles about career growth, coding practice, course updates, and study habits that help learners stay consistent and make measurable progress."
    highlights={[
      'Study guides and revision checklists',
      'Course launch updates and platform news',
      'Career advice for students and developers',
      'Short reads designed to be useful, not noisy',
    ]}
    sections={[
      {
        title: 'What we publish',
        body: 'We keep our content practical and concise. Expect tutorials, quick wins, product announcements, and recommendations that support real learning goals.',
      },
      {
        title: 'How often',
        body: 'We publish when we have something valuable to say. The focus is quality and usefulness rather than volume.',
      },
    ]}
    stats={[
      { label: 'Articles', value: '40+' },
      { label: 'Topics', value: '8' },
      { label: 'Guides', value: '25+' },
      { label: 'Updates', value: 'Weekly' },
    ]}
  />
);

export default BlogPage;
