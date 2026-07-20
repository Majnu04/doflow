import React, { useState } from 'react';
import { FiCheck, FiArrowRight, FiZap, FiBookOpen, FiAward, FiUsers, FiMessageCircle, FiClock } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';

const PLANS = [
  {
    id: 'free',
    name: 'Explorer',
    price: 0,
    period: '',
    description: 'Perfect for getting started with your learning journey.',
    variant: 'default' as const,
    features: [
      { text: 'Access to free courses', included: true },
      { text: 'Basic AI Tutor (3 questions/day)', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Course certificates', included: false },
      { text: 'Premium AI Mentor', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Builder',
    price: 999,
    period: '/month',
    description: 'Everything you need to master new skills and advance your career.',
    variant: 'primary' as const,
    features: [
      { text: 'All free course content', included: true },
      { text: 'Unlimited AI Mentor access', included: true },
      { text: 'Code review by AI', included: true },
      { text: 'Personalized study plans', included: true },
      { text: 'Course certificates', included: true },
      { text: 'Priority email support', included: true },
    ],
    cta: 'Start Building',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'team',
    name: 'Team',
    price: 4999,
    period: '/month',
    description: 'For teams and organizations training multiple developers.',
    variant: 'outline' as const,
    features: [
      { text: 'Everything in Builder', included: true },
      { text: 'Up to 10 team members', included: true },
      { text: 'Team progress dashboard', included: true },
      { text: 'Custom learning paths', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SSO & admin controls', included: true },
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const FAQS = [
  { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.' },
  { q: 'Is there a free trial for the Builder plan?', a: 'Yes! Builder comes with a 7-day free trial. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets through our secure payment partner.' },
    { q: 'Can I cancel my subscription?', a: "Absolutely. Cancel anytime from your dashboard. You'll retain access until the end of your current billing period." },
  { q: 'Do you offer student discounts?', a: 'Yes! Students with a valid .edu email get 50% off the Builder plan. Contact support to apply.' },
];

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="absolute inset-0 -z-10 dot-background opacity-20" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="primary" size="sm" className="mb-4 inline-flex">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-6">
            Simple, transparent
            <span className="block gradient-text">pricing</span>
          </h1>
          <p className="text-fluid-base text-light-textSecondary dark:text-dark-textSecondary max-w-xl mx-auto leading-relaxed mb-8">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className={!isAnnual ? 'text-light-text dark:text-dark-text font-semibold' : 'text-light-textMuted dark:text-dark-muted'}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isAnnual ? 'bg-brand-primary' : 'bg-border-subtle dark:bg-dark-border'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-light-card dark:bg-dark-card rounded-full transition-transform ${isAnnual ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={isAnnual ? 'text-light-text dark:text-dark-text font-semibold' : 'text-light-textMuted dark:text-dark-muted'}>
              Annual
              <Badge variant="success" size="xs" className="ml-1.5">Save 20%</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 items-start">
            {PLANS.map((plan) => {
              const displayPrice = isAnnual && plan.price > 0
                ? Math.round(plan.price * 0.8)
                : plan.price;

              return (
                <Card
                  key={plan.id}
                  variant={plan.highlight ? 'elevated' : 'default'}
                  hover={false}
                  padding="lg"
                  className={`relative ${plan.highlight ? 'ring-2 ring-brand-primary shadow-brand' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="primary" size="xs" dot>{plan.badge}</Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-1">{plan.name}</h3>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-light-text dark:text-dark-text">
                        {plan.price === 0 ? 'Free' : `₹${displayPrice}`}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-light-textMuted dark:text-dark-muted">
                          {plan.period}
                          {isAnnual && plan.price > 0 && (
                            <span className="text-[10px] text-emerald-500 dark:text-emerald-400 ml-1">billed annually</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <FiCheck className={`w-3.5 h-3.5 flex-shrink-0 ${feature.included ? 'text-emerald-500 dark:text-emerald-400' : 'text-light-textMuted/40 dark:text-dark-muted/40'}`} />
                        <span className={`text-xs ${feature.included ? 'text-light-textSecondary dark:text-dark-textSecondary' : 'text-light-textMuted/50 dark:text-dark-muted/50 line-through'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.highlight ? 'primary' : 'outline'}
                    fullWidth
                    size="md"
                    icon={<FiArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                    onClick={() => window.location.hash = '/auth'}
                  >
                    {plan.cta}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-light-cardAlt/30 dark:bg-dark-cardAlt/30">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">What's included</h2>
            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Every plan comes with these core features</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: <FiBookOpen className="w-5 h-5" />, title: 'HD Video Courses', desc: 'Crystal clear content from expert instructors' },
              { icon: <FiZap className="w-5 h-5" />, title: 'AI-Powered Learning', desc: 'Personalized mentor that adapts to your pace' },
              { icon: <FiClock className="w-5 h-5" />, title: 'Lifetime Access', desc: 'Learn at your own pace, forever' },
              { icon: <FiAward className="w-5 h-5" />, title: 'Certificates', desc: 'Earn credentials recognized by industry' },
              { icon: <FiUsers className="w-5 h-5" />, title: 'Community', desc: 'Connect with 50K+ fellow learners' },
                { icon: <FiMessageCircle className="w-5 h-5" />, title: '24/7 Support', desc: "We're always here to help you succeed" },
            ].map((feature, i) => (
              <div key={i} className="premium-card p-5 group text-center">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-primary/15 transition-colors">
                  <div className="text-brand-primary">{feature.icon}</div>
                </div>
                <h4 className="text-xs font-bold text-light-text dark:text-dark-text mb-1">{feature.title}</h4>
                <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Everything you need to know about our pricing</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="premium-card group" open={i === 0}>
                <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-bold text-light-text dark:text-dark-text">
                  {faq.q}
                  <FiArrowRight className="w-4 h-4 text-light-textMuted dark:text-dark-muted transform group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-xs text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
