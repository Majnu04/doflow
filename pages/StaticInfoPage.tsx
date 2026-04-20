import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

export type InfoSection = {
  title: string;
  body: string;
};

export type InfoStat = {
  label: string;
  value: string;
};

export type StaticInfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  sections: InfoSection[];
  stats?: InfoStat[];
  ctaLabel?: string;
  ctaHref?: string;
};

const StaticInfoPage: React.FC<StaticInfoPageProps> = ({
  eyebrow,
  title,
  description,
  highlights,
  sections,
  stats,
  ctaLabel = 'Explore Courses',
  ctaHref = '/#/courses',
}) => {
  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-light-bg text-light-text pt-24 md:pt-28 pb-12 transition-colors duration-300">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(224,100,56,0.16),_transparent_62%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-end mb-8 lg:mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full border border-border-subtle bg-light-card text-brand-primary text-sm font-semibold shadow-sm">
              {eyebrow}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.02] mb-5 text-light-text">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-light-textSecondary leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>

          <div className="bg-light-card border border-border-subtle rounded-[2rem] p-6 md:p-7 shadow-[0_24px_60px_rgba(32,29,25,0.10)]">
            <h2 className="text-2xl font-display font-bold mb-3">Why DoFlow</h2>
            <p className="text-light-textSecondary leading-relaxed mb-5">
              We design the product around focused learning, practical outcomes, and a calm interface that feels easy to trust.
            </p>

            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-light-cardAlt border border-border-subtle p-4 text-center">
                    <div className="text-brand-primary text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-light-textMuted">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-light-card border border-border-subtle rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(32,29,25,0.08)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-display font-bold">What you’ll find here</h2>
                <span className="text-sm text-light-textMuted">{highlights.length} highlights</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-light-cardAlt border border-border-subtle p-4 text-light-textSecondary leading-relaxed shadow-sm"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {sections.map((section, index) => (
                <div
                  key={section.title}
                  className="bg-light-card border border-border-subtle rounded-[1.75rem] p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary font-bold mb-4">
                    0{index + 1}
                  </div>
                  <h3 className="text-xl font-display font-bold mb-3 text-light-text">{section.title}</h3>
                  <p className="text-light-textSecondary leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-gradient-to-br from-brand-primary/12 via-brand-accent/10 to-white border border-border-subtle rounded-[2rem] p-6 md:p-8 shadow-[0_24px_60px_rgba(32,29,25,0.10)]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-border-subtle text-brand-primary text-sm font-semibold mb-4">
                Product Snapshot
              </div>
              <p className="text-light-textSecondary leading-relaxed mb-6">
                A premium learning platform with structured courses, strong onboarding, and a clean experience that keeps the focus on learning.
              </p>

              <div className="space-y-3 mb-6">
                {['Clear course structure', 'Real-world learning flow', 'Fast access to content', 'Low-friction UI'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/75 border border-border-subtle px-4 py-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                    <span className="text-light-textSecondary">{item}</span>
                  </div>
                ))}
              </div>

              <a
                href={ctaHref}
                className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-brand-primary px-5 py-3 font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primaryHover transition-colors"
              >
                {ctaLabel}
                <FiArrowRight />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StaticInfoPage;
