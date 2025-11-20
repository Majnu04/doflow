import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'How do I enroll in a course?',
      answer: 'Browse our course catalog, select a course, and click "Enroll Now". Complete the payment process, and you\'ll get instant access to all course materials.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, UPI, net banking, and other payment methods through Razorpay.'
    },
    {
      question: 'Do I get a certificate after completing a course?',
      answer: 'Yes! Upon completing all course requirements, you\'ll receive an industry-recognized certificate that you can share on LinkedIn and other platforms.'
    },
    {
      question: 'Can I access courses on mobile devices?',
      answer: 'Absolutely! Our platform is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktops.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with a course and have completed less than 30% of it, you can request a full refund. Check our refund policy page for more details.'
    },
    {
      question: 'Do courses have expiration dates?',
      answer: 'No! Once you enroll in a course, you get lifetime access to all course materials, including future updates.'
    },
    {
      question: 'Can I download course videos?',
      answer: 'Course videos are available for streaming only to protect instructor content. However, you can access them anytime with your internet connection.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach us via email at doflow004@gmail.com or call us at +91 7893804498. We typically respond within 24 hours.'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-light-textSecondary dark:text-dark-muted mb-12">
          Find answers to common questions about DoFlow
        </p>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text pr-4">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <FiChevronUp className="w-5 h-5 text-brand-primary flex-shrink-0" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-light-textMuted dark:text-dark-muted flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-light-textSecondary dark:text-dark-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Still have questions?
          </h2>
          <p className="text-light-textSecondary dark:text-dark-muted mb-6">
            Our support team is here to help
          </p>
          <a
            href="/#/help"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-lg transition-all duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;