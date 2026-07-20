import React from 'react';
import { FiBook, FiTrendingUp, FiCode, FiClock, FiArrowRight, FiCalendar, FiUser, FiTag, FiSearch } from 'react-icons/fi';
import { Button, Card, Badge, Input } from '../src/components/ui';

const FEATURED_POSTS = [
  {
    id: '1',
    title: 'The Complete Guide to Cracking DSA Interviews in 2025',
    excerpt: 'A structured approach to mastering Data Structures & Algorithms, from arrays to dynamic programming, with real FAANG interview questions.',
    category: 'DSA',
    author: 'DoFlow Team',
    date: 'Jan 15, 2025',
    readTime: '12 min read',
    featured: true,
    gradient: 'from-brand-primary/10 to-brand-accent/5',
  },
  {
    id: '2',
    title: 'React 19: What Changed and Why It Matters',
    excerpt: 'Deep dive into React Server Components, Actions, and the new hooks that make building modern web apps simpler than ever.',
    category: 'Web Dev',
    author: 'DoFlow Team',
    date: 'Jan 8, 2025',
    readTime: '8 min read',
    featured: true,
    gradient: 'from-sky-500/10 to-indigo-500/5',
  },
  {
    id: '3',
    title: 'Building an AI-Powered Learning Platform: Our Architecture',
    excerpt: 'How we built DoFlow\'s AI mentor using Gemini, real-time code execution, and adaptive learning paths.',
    category: 'Engineering',
    author: 'Gouri Shanker',
    date: 'Dec 20, 2024',
    readTime: '15 min read',
    featured: true,
    gradient: 'from-emerald-500/10 to-teal-500/5',
  },
];

const UPCOMING_POSTS = [
  { title: '5 VS Code Extensions Every Developer Needs', category: 'Tools', readTime: '5 min', date: 'Coming Soon' },
  { title: 'From Bootcamp to FAANG: A Success Story', category: 'Careers', readTime: '10 min', date: 'Coming Soon' },
  { title: 'Understanding System Design in Plain English', category: 'Architecture', readTime: '14 min', date: 'Coming Soon' },
  { title: 'The Psychology of Consistent Learning', category: 'Productivity', readTime: '7 min', date: 'Coming Soon' },
  { title: 'Mastering TypeScript Generics Once and For All', category: 'TypeScript', readTime: '9 min', date: 'Coming Soon' },
  { title: 'How We Reduced Build Time by 60%', category: 'Engineering', readTime: '11 min', date: 'Coming Soon' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  DSA: <FiCode className="w-4 h-4" />,
  'Web Dev': <FiBook className="w-4 h-4" />,
  Engineering: <FiTrendingUp className="w-4 h-4" />,
  Tools: <FiTag className="w-4 h-4" />,
  Careers: <FiUser className="w-4 h-4" />,
  Architecture: <FiTag className="w-4 h-4" />,
  Productivity: <FiClock className="w-4 h-4" />,
  TypeScript: <FiCode className="w-4 h-4" />,
};

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-light-bg text-light-text">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />
        <div className="absolute inset-0 -z-10 dot-background opacity-20" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="primary" size="sm" className="mb-4 inline-flex">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-6">
            Insights for
            <span className="block gradient-text">modern builders</span>
          </h1>
          <p className="text-fluid-base text-light-textSecondary max-w-xl mx-auto leading-relaxed mb-8">
            Tutorials, career advice, and engineering deep-dives from the DoFlow team.
          </p>
          <div className="max-w-md mx-auto relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-textMuted" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 bg-light-card border border-border-subtle rounded-xl text-sm text-light-text placeholder:text-light-textMuted/60 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Featured Articles</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURED_POSTS.map((post) => (
              <button key={post.id} className={`premium-card p-5 text-left group bg-gradient-to-br ${post.gradient}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="primary" size="xs" dot>{post.category}</Badge>
                  <span className="text-[10px] text-light-textMuted flex items-center gap-1">
                    <FiClock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-light-text mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-xs text-light-textSecondary line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-3 h-3 text-light-textMuted" />
                    <span className="text-[10px] text-light-textMuted">{post.author}</span>
                  </div>
                  <span className="text-[10px] text-light-textMuted flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" /> {post.date}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming / Coming Soon */}
      <section className="py-12 bg-light-cardAlt/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">Coming Soon</h2>
            <Badge variant="secondary" size="xs">{UPCOMING_POSTS.length} articles</Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {UPCOMING_POSTS.map((post, i) => (
              <Card key={i} hover={false} variant="default" padding="md" className="opacity-70">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-brand-primary/60">{CATEGORY_ICONS[post.category] || <FiTag className="w-4 h-4" />}</div>
                  <Badge variant="secondary" size="xs">{post.category}</Badge>
                </div>
                <h4 className="text-xs font-bold text-light-text mb-1">{post.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-light-textMuted">
                  <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {post.readTime}</span>
                  <span>{post.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Card hover={false} variant="elevated" className="text-center p-10 bg-gradient-to-br from-brand-primary/5 to-transparent">
            <FiBook className="w-10 h-10 text-brand-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Stay in the loop</h2>
            <p className="text-sm text-light-textSecondary mb-6 max-w-md mx-auto">
              Get notified when we publish new articles, tutorials, and career guides.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2.5 bg-light-cardAlt border border-border-subtle rounded-xl text-sm text-light-text placeholder:text-light-textMuted/60 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
              <Button variant="primary" size="md">Subscribe</Button>
            </div>
            <p className="text-[10px] text-light-textMuted mt-3">No spam. Unsubscribe anytime.</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
