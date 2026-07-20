import React, { useEffect, useState } from 'react';
import { FiUsers, FiAward, FiTrendingUp, FiTarget, FiArrowRight, FiCode, FiHeart, FiGlobe, FiShield, FiZap, FiCheckCircle } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';
import api from '../src/utils/api';

interface PlatformStats {
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  successRate: number;
}

const TEAM_MEMBERS = [
  { name: 'Gouri Shanker', role: 'Founder & CEO', avatar: 'https://ui-avatars.com/api/?name=GS&size=120&background=E06438&color=fff' },
  { name: 'DoFlow Team', role: 'Engineering', avatar: 'https://ui-avatars.com/api/?name=DF&size=120&background=F3A45C&color=fff' },
  { name: 'Community', role: 'Instructors', avatar: 'https://ui-avatars.com/api/?name=CI&size=120&background=6366f1&color=fff' },
];

const VALUES = [
  { icon: <FiZap className="w-5 h-5" />, title: 'Builder-First', description: 'Every feature is designed for developers who ship. No fluff, just tools that accelerate your workflow.' },
  { icon: <FiHeart className="w-5 h-5" />, title: 'Quality Obsessed', description: 'Hand-picked instructors, reviewed content, and a relentless focus on learning outcomes over content volume.' },
  { icon: <FiGlobe className="w-5 h-5" />, title: 'Accessible', description: 'World-class education available to anyone, anywhere. Works on any device, at any pace.' },
  { icon: <FiShield className="w-5 h-5" />, title: 'Trust & Integrity', description: 'Transparent pricing, honest reviews, and a community built on mutual respect and support.' },
  { icon: <FiUsers className="w-5 h-5" />, title: 'Community Driven', description: 'Learning is better together. Our community mentors, supports, and celebrates each other.' },
  { icon: <FiCode className="w-5 h-5" />, title: 'Practical Learning', description: 'Real projects, real code, real skills. Everything you learn applies directly to your career.' },
];

const MILESTONES = [
  { year: '2024', title: 'Founded', description: 'DoFlow Academy launched with a mission to democratize tech education.' },
  { year: '2024', title: 'First 1,000 Students', description: 'Reached our first thousand learners within 6 months of launch.' },
  { year: '2025', title: 'AI Mentor', description: 'Launched AI-powered mentorship with Gemini integration.' },
  { year: '2025', title: '50K+ Students', description: 'Growing community of developers learning and building together.' },
];

const AboutPage: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalStudents: 0, totalCourses: 0, totalInstructors: 0, successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/public/stats');
        setStats(response.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: <FiUsers />, value: stats.totalStudents, label: 'Active Students', suffix: '+' },
    { icon: <FiAward />, value: stats.totalCourses, label: 'Courses', suffix: '+' },
    { icon: <FiTrendingUp />, value: stats.totalInstructors, label: 'Instructors', suffix: '+' },
    { icon: <FiTarget />, value: stats.successRate, label: 'Success Rate', suffix: '%' },
  ];

  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      {/* Hero */}
      <section className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="absolute inset-0 -z-10 dot-background opacity-20" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="primary" size="sm" className="mb-4 inline-flex">Our Story</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-6">
            Education designed for
            <span className="block gradient-text">modern builders</span>
          </h1>
          <p className="text-fluid-base text-light-textSecondary max-w-2xl mx-auto leading-relaxed">
            DoFlow Academy was born from a simple belief: learning to build should feel as good as building itself.
            We create tools, content, and experiences that respect your time and accelerate your growth.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((stat, i) => (
              <Card key={i} hover={false} variant="glass" padding="md" className="text-center">
                <div className="text-brand-primary text-xl mb-2 flex justify-center">{stat.icon}</div>
                <p className="text-2xl font-bold text-light-text">
                  {loading ? '...' : `${stat.value.toLocaleString()}${stat.suffix}`}
                </p>
                <p className="text-xs text-light-textMuted mt-1">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="primary" size="xs" className="mb-3 inline-flex">Mission</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Making professional skills <span className="text-brand-primary">accessible to everyone</span>
              </h2>
              <p className="text-light-textSecondary leading-relaxed mb-4">
                We believe education is the key to unlocking human potential. DoFlow connects learners with expert instructors,
                practical projects, and an AI-powered mentor — all in one seamless platform.
              </p>
              <p className="text-light-textSecondary leading-relaxed">
                Whether you're starting your first coding lesson or preparing for a FAANG interview,
                we're here to support every step of your journey.
              </p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-brand-primary/10 rounded-full" />
              <Card variant="elevated" hover={false} className="relative p-6">
                <div className="space-y-4">
                  {[
                    'HD video lessons from industry experts',
                    'AI-powered mentor for 24/7 support',
                    'Hands-on projects and coding challenges',
                    'Industry-recognized certifications',
                    'Supportive community of 50K+ learners',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <FiCheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-light-textSecondary">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-light-cardAlt/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="primary" size="xs" className="mb-3 inline-flex">Values</Badge>
            <h2 className="text-3xl font-bold">What drives us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 stagger-children">
            {VALUES.map((value, i) => (
              <div key={i} className="premium-card p-5 group">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-primary/15 transition-colors">
                  <div className="text-brand-primary">{value.icon}</div>
                </div>
                <h3 className="text-sm font-bold text-light-text mb-1.5">{value.title}</h3>
                <p className="text-xs text-light-textSecondary leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="primary" size="xs" className="mb-3 inline-flex">Journey</Badge>
            <h2 className="text-3xl font-bold">Our milestones</h2>
          </div>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border-subtle" />
            {MILESTONES.map((m, i) => (
              <div key={i} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="hidden md:block md:w-1/2" />
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-primary rounded-full ring-4 ring-light-bg z-10" />
                <div className="ml-10 md:ml-0 md:w-1/2">
                  <Card hover={false} variant="default" padding="md">
                    <Badge variant="primary" size="xs" className="mb-2">{m.year}</Badge>
                    <h4 className="text-sm font-bold text-light-text mb-1">{m.title}</h4>
                    <p className="text-xs text-light-textSecondary">{m.description}</p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Card hover={false} variant="elevated" className="text-center p-10 md:p-14 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to start building?</h2>
            <p className="text-sm text-light-textSecondary mb-6 max-w-lg mx-auto">
              Join 50,000+ developers learning to build with confidence on DoFlow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="primary" icon={<FiArrowRight className="w-4 h-4" />} onClick={() => window.location.hash = '/courses'}>
                Explore Courses
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.location.hash = '/auth'}>
                Create Free Account
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
