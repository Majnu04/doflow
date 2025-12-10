import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiHelpCircle } from 'react-icons/fi';

const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Sign Up" in the top right corner, fill in your details (name, email, password), and click "Create Account". You\'ll receive a verification email to activate your account.'
        },
        {
          q: 'How do I enroll in a course?',
          a: 'Browse our courses, click on any course to view details, and click the "Enroll Now" button. You can either purchase the course or add it to your cart for checkout.'
        },
        {
          q: 'Is there a free trial?',
          a: 'We offer free preview lessons for most courses so you can experience the content quality before enrolling. Some courses also offer complete free access.'
        }
      ]
    },
    {
      category: 'Courses & Learning',
      questions: [
        {
          q: 'Can I access courses on mobile devices?',
          a: 'Yes! DoFlow is fully responsive and works seamlessly on all devices including smartphones, tablets, and desktop computers.'
        },
        {
          q: 'How long do I have access to a course?',
          a: 'Once enrolled, you have lifetime access to the course content, including any future updates or additional materials added by the instructor.'
        },
        {
          q: 'Do I get a certificate after completing a course?',
          a: 'Yes, upon successfully completing all lessons and assessments, you\'ll receive a certificate of completion that you can download and share on social media or add to your resume.'
        },
        {
          q: 'Can I download course videos?',
          a: 'Course videos are available for streaming online. Downloading may be available for select courses and is indicated on the course page.'
        }
      ]
    },
    {
      category: 'Payments & Billing',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment partner Razorpay.'
        },
        {
          q: 'Is my payment information secure?',
          a: 'Yes, all payments are processed through Razorpay, a PCI DSS compliant payment gateway. We never store your complete card details on our servers.'
        },
        {
          q: 'What is your refund policy?',
          a: 'We offer a 30-day money-back guarantee. If you\'re not satisfied with a course, contact us within 30 days of purchase for a full refund.'
        },
        {
          q: 'Do you offer discounts or promotions?',
          a: 'Yes! We regularly offer promotions and discounts. Subscribe to our newsletter or follow us on social media to stay updated on special offers.'
        }
      ]
    },
    {
      category: 'Technical Support',
      questions: [
        {
          q: 'The video won\'t play. What should I do?',
          a: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. Ensure you have a stable internet connection. If issues persist, contact support.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Forgot Password" on the login page, enter your registered email, and follow the instructions sent to your inbox to reset your password.'
        },
        {
          q: 'Which browsers are supported?',
          a: 'DoFlow works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
        },
        {
          q: 'How do I update my profile information?',
          a: 'Log in to your account, go to your Profile page, and click "Edit Profile". You can update your name, email, profile picture, and other details.'
        }
      ]
    },
    {
      category: 'Certificates',
      questions: [
        {
          q: 'How do I get my certificate?',
          a: 'Complete all lessons and assessments in a course with the required passing score. Your certificate will be automatically generated and available in the Certificates section.'
        },
        {
          q: 'Can I verify someone\'s certificate?',
          a: 'Yes! Each certificate has a unique verification code. Visit our Certificate Verification page and enter the code to verify authenticity.'
        },
        {
          q: 'Can I share my certificate on LinkedIn?',
          a: 'Absolutely! You can download your certificate as a PDF and upload it to LinkedIn, or share the verification link directly on your profile.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-light-bg pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <FiHelpCircle className="w-16 h-16 text-brand-primary mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-light-text mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-light-textSecondary leading-relaxed">
            Find quick answers to common questions about DoFlow
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h2 className="text-2xl font-bold text-light-text mb-6">{category.category}</h2>
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div
                      key={faqIndex}
                      className="bg-light-card rounded-xl border border-border-subtle overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-sand transition-colors"
                      >
                        <span className="font-semibold text-light-text pr-4">{faq.q}</span>
                        {isOpen ? (
                          <FiChevronUp className="w-5 h-5 text-brand-primary flex-shrink-0" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-light-textMuted flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-light-textSecondary leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-brand-accentSoft rounded-xl p-12 text-center border border-brand-accent">
            <h2 className="text-3xl font-bold text-light-text mb-4">Still Have Questions?</h2>
            <p className="text-lg text-light-textSecondary mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:doflow004@gmail.com"
                className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <button
                onClick={() => window.location.hash = '/help'}
                className="px-8 py-3 bg-light-card hover:bg-light-cardAlt text-light-text font-medium rounded-lg transition-colors border border-border-subtle"
              >
                Visit Help Center
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
