import React from 'react';
import StaticInfoPage from './StaticInfoPage';

const HelpCenterPage: React.FC = () => (
  <StaticInfoPage
    eyebrow="Help Center"
    title="Get help quickly and move forward"
    description="Find answers to the most common questions about courses, accounts, payments, and learning access."
    highlights={[
      'Account, login, and password help',
      'Course access and enrollment questions',
      'Billing and payment guidance',
      'Platform and learning support resources',
    ]}
    sections={[
      {
        title: 'Fast answers',
        body: 'We organize common issues so learners can get back to studying without waiting for a long support chain.',
      },
      {
        title: 'Need more help?',
        body: 'If the answer is not here, use the contact details in the footer and our team will guide you to the next step.',
      },
    ]}
    stats={[
      { label: 'Support topics', value: '20+' },
      { label: 'Response paths', value: 'Clear' },
      { label: 'User focus', value: 'High' },
      { label: 'Availability', value: 'Always' },
    ]}
    ctaLabel="Browse FAQs"
    ctaHref="/#/faq"
  />
);

export default HelpCenterPage;
