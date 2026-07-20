import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Zap,
  Users,
  CheckCircle,
  X,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  topCategories,
  secondRowCategories,
  featuredRoadmaps,
  popularCompanies,
  trendingSearches,
  recentSearches,
  type RoadmapCategory,
  type RoadmapItem,
  type RoadmapBadge,
} from '../data/roadmaps';

const iconMap: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  Code2: LucideIcons.Code2, Coffee: LucideIcons.Coffee, FileCode2: LucideIcons.FileCode2,
  FileCode: LucideIcons.FileCode, Terminal: LucideIcons.Terminal, Wrench: LucideIcons.Wrench,
  Zap: LucideIcons.Zap, Smartphone: LucideIcons.Smartphone, Target: LucideIcons.Target,
  Globe: LucideIcons.Globe, Palette: LucideIcons.Palette, Wind: LucideIcons.Wind,
  Layout: LucideIcons.Layout, Atom: LucideIcons.Atom, Triangle: LucideIcons.Triangle,
  Leaf: LucideIcons.Leaf, Hexagon: LucideIcons.Hexagon, Flame: LucideIcons.Flame,
  RefreshCw: LucideIcons.RefreshCw, Play: LucideIcons.Play, Eye: LucideIcons.Eye,
  Server: LucideIcons.Server, FlaskConical: LucideIcons.FlaskConical, Link: LucideIcons.Link,
  GitBranch: LucideIcons.GitBranch, Lock: LucideIcons.Lock, Boxes: LucideIcons.Boxes,
  Radio: LucideIcons.Radio, Brain: LucideIcons.Brain, Network: LucideIcons.Network,
  Box: LucideIcons.Box, MessageSquare: LucideIcons.MessageSquare, Sparkles: LucideIcons.Sparkles,
  PenTool: LucideIcons.PenTool, Cpu: LucideIcons.Cpu, Bot: LucideIcons.Bot,
  BookOpen: LucideIcons.BookOpen, Plug: LucideIcons.Plug,   Cloud: LucideIcons.Cloud,
  Container: LucideIcons.Container, Settings: LucideIcons.Settings,
  Activity: LucideIcons.Activity, Database: LucideIcons.Database, Snowflake: LucideIcons.Snowflake,
  Shield: LucideIcons.Shield, Wifi: LucideIcons.Wifi, Bug: LucideIcons.Bug,
  Monitor: LucideIcons.Monitor, KeyRound: LucideIcons.KeyRound, ShieldCheck: LucideIcons.ShieldCheck,
  Rocket: LucideIcons.Rocket, Binary: LucideIcons.Binary, Trophy: LucideIcons.Trophy,
  LayoutGrid: LucideIcons.LayoutGrid, FileText: LucideIcons.FileText, Users: LucideIcons.Users,
  MessageCircle: LucideIcons.MessageCircle, Mic: LucideIcons.Mic, Calculator: LucideIcons.Calculator,
  MessagesSquare: LucideIcons.MessagesSquare, Layers: LucideIcons.Layers, BarChart3: LucideIcons.BarChart3,
  BrainCircuit: LucideIcons.BrainCircuit, Gamepad2: LucideIcons.Gamepad2, Link2: LucideIcons.Link2,
  Search: LucideIcons.Search,
};

const getIcon = (name: string) => iconMap[name] || LucideIcons.Circle;

const badgeConfig: Record<RoadmapBadge, { label: string; className: string }> = {
  NEW: {
    label: 'NEW',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  },
  TRENDING: {
    label: 'TRENDING',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  },
  POPULAR: {
    label: 'POPULAR',
    className: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
  },
  UPDATED: {
    label: 'UPDATED',
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
  },
  HOT: {
    label: 'HOT',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
  },
};

const badgeDotColor: Record<RoadmapBadge, string> = {
  NEW: 'bg-emerald-500',
  TRENDING: 'bg-blue-500',
  POPULAR: 'bg-brand-primary',
  UPDATED: 'bg-violet-500',
  HOT: 'bg-rose-500',
};

const BadgePill: React.FC<{ badge: RoadmapBadge }> = ({ badge }) => {
  const config = badgeConfig[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${config.className}`}>
      <span className={`w-1 h-1 rounded-full ${badgeDotColor[badge]}`} />
      {config.label}
    </span>
  );
};

const CategoryColumn: React.FC<{ category: RoadmapCategory }> = ({ category }) => {
  const Icon = getIcon(category.icon);
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Icon className="w-3.5 h-3.5 text-brand-primary" strokeWidth={2} />
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted">
          {category.title}
        </h4>
        {category.badge && <BadgePill badge={category.badge} />}
      </div>
      <div className="flex flex-col gap-0.5">
        {category.items.map((item) => (
          <RoadmapItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

const RoadmapItemRow: React.FC<{ item: RoadmapItem }> = ({ item }) => {
  const Icon = getIcon(item.icon);
  return (
    <button className="mega-menu-item group flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-left w-full transition-all duration-180 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10">
      <Icon className="w-3.5 h-3.5 text-light-textMuted dark:text-dark-muted flex-shrink-0 transition-all duration-200 group-hover:text-brand-primary group-hover:scale-110" strokeWidth={1.8} />
      <span className="text-[13px] font-medium text-light-text dark:text-dark-text group-hover:text-brand-primary dark:group-hover:text-brand-primary truncate transition-colors duration-180">
        {item.name}
      </span>
      {item.badge && <BadgePill badge={item.badge} />}
      <ChevronRight className="w-3 h-3 text-light-textMuted dark:text-dark-muted opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto flex-shrink-0 translate-x-[-4px] group-hover:translate-x-0" />
    </button>
  );
};

interface RoadmapsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoadmapsMegaMenu: React.FC<RoadmapsMegaMenuProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const allCategories = useMemo(() => [...topCategories, ...secondRowCategories], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: { category: string; items: RoadmapItem[] }[] = [];
    for (const cat of allCategories) {
      const matched = cat.items.filter((i) => i.name.toLowerCase().includes(q));
      if (matched.length > 0) {
        results.push({ category: cat.title, items: matched });
      }
    }
    return results;
  }, [searchQuery, allCategories]);

  const handleSearchSelect = (name: string) => {
    setSearchQuery(name);
    searchInputRef.current?.focus();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/10 dark:bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mega-menu-container fixed left-1/2 -translate-x-1/2 top-[76px] z-50 w-[1100px] max-w-[calc(100vw-48px)] rounded-[24px] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow:
                '0 8px 32px rgba(32,29,25,0.08), 0 32px 64px rgba(32,29,25,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div className="dark:hidden" />
            <div
              className="hidden dark:block"
              style={{
                background: 'rgba(24,23,28,0.94)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(42,41,48,0.6)',
                boxShadow:
                  '0 8px 32px rgba(0,0,0,0.4), 0 32px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
                borderRadius: '24px',
                position: 'absolute',
                inset: 0,
                zIndex: -1,
              }}
            />

            <div className="relative p-8">
              {/* Top Section */}
              <div className="flex items-start justify-between gap-8 mb-8">
                <div className="flex-shrink-0">
                  <h2 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight mb-1">
                    Explore Career Roadmaps
                  </h2>
                  <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary max-w-md">
                    Choose your learning journey and become job-ready with structured learning paths.
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full max-w-sm flex-shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-textMuted dark:text-dark-muted pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    placeholder="Search Python, React, DevOps..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-light-cardAlt/70 dark:bg-dark-cardAlt/70 border border-border-subtle/60 dark:border-dark-border/60 rounded-xl text-light-text dark:text-dark-text placeholder-light-textMuted/60 dark:placeholder-dark-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 focus:bg-light-card dark:focus:bg-dark-card transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-light-card dark:hover:bg-dark-cardAlt transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-light-textMuted dark:text-dark-muted" />
                    </button>
                  )}

                  <AnimatePresence>
                    {searchFocused && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50 border border-border-subtle/60 dark:border-dark-border/60"
                        style={{
                          background: 'rgba(255,255,255,0.96)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 8px 32px rgba(32,29,25,0.1), 0 24px 48px rgba(32,29,25,0.06)',
                        }}
                      >
                        <div
                          className="hidden dark:block absolute inset-0 rounded-xl"
                          style={{
                            background: 'rgba(24,23,28,0.97)',
                            border: '1px solid rgba(42,41,48,0.5)',
                          }}
                        />
                        <div className="relative">
                          {searchResults ? (
                            searchResults.length > 0 ? (
                              <div className="p-2 max-h-64 overflow-y-auto scrollbar-thin">
                                {searchResults.map((group) => (
                                  <div key={group.category} className="mb-2">
                                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted">
                                      {group.category}
                                    </p>
                                    {group.items.map((item) => {
                                      const ItemIcon = getIcon(item.icon);
                                      return (
                                        <button
                                          key={item.id}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSearchSelect(item.name);
                                          }}
                                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors"
                                        >
                                          <ItemIcon className="w-3.5 h-3.5 text-light-textMuted dark:text-dark-muted" strokeWidth={1.8} />
                                          <span className="text-sm font-medium text-light-text dark:text-dark-text">
                                            {item.name}
                                          </span>
                                          {item.badge && <BadgePill badge={item.badge} />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <p className="text-sm text-light-textMuted dark:text-dark-muted">
                                  No roadmaps found for "{searchQuery}"
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="p-3">
                              {recentSearches.length > 0 && (
                                <div className="mb-3">
                                  <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    Recent Searches
                                  </p>
                                  {recentSearches.map((term) => (
                                    <button
                                      key={term}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSearchSelect(term);
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors"
                                    >
                                      <span className="text-sm text-light-text dark:text-dark-text">{term}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div>
                                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted flex items-center gap-1.5">
                                  <TrendingUp className="w-3 h-3" />
                                  Trending Searches
                                </p>
                                <div className="flex flex-wrap gap-1.5 px-3 py-2">
                                  {trendingSearches.map((term) => (
                                    <button
                                      key={term}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSearchSelect(term);
                                      }}
                                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-light-cardAlt/70 dark:bg-dark-cardAlt/70 text-light-textSecondary dark:text-dark-textSecondary hover:bg-brand-primary/10 hover:text-brand-primary dark:hover:bg-brand-primary/10 dark:hover:text-brand-primary border border-border-subtle/40 dark:border-dark-border/40 transition-all duration-180"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="flex gap-8">
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-5 gap-6 mb-8">
                    {topCategories.map((cat) => (
                      <CategoryColumn key={cat.id} category={cat} />
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-6 mb-8">
                    {secondRowCategories.map((cat) => (
                      <CategoryColumn key={cat.id} category={cat} />
                    ))}
                  </div>

                  <div className="border-t border-border-subtle/40 dark:border-dark-border/40 pt-6">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-4 text-center">
                      Roadmaps used by developers preparing for
                    </p>
                    <div className="flex items-center justify-center gap-8 flex-wrap">
                      {popularCompanies.map((company) => (
                        <div
                          key={company.name}
                          className="company-logo flex items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 cursor-default"
                        >
                          <div className="w-7 h-7 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/40 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-light-textSecondary dark:text-dark-textSecondary">
                              {company.letter}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary">
                            {company.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Featured Card */}
                <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
                  <div className="rounded-2xl overflow-hidden relative" style={{
                    background: 'linear-gradient(135deg, #E06438, #F3A45C)',
                  }}>
                    <div className="p-6 text-white relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          Featured Learning Path
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{featuredRoadmaps[0].title}</h3>
                      <p className="text-sm opacity-85 mb-4">{featuredRoadmaps[0].subtitle}</p>

                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {featuredRoadmaps[0].stats.map((stat) => (
                          <div key={stat.label} className="flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 opacity-70" />
                            <span className="text-xs font-medium opacity-90">
                              {stat.value} {stat.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button className="w-full py-2.5 rounded-xl bg-white text-brand-primary text-sm font-bold hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                        {featuredRoadmaps[0].buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                  </div>

                  {isAuthenticated && user && (
                    <div className="rounded-2xl p-5 bg-light-card dark:bg-dark-card border border-border-subtle/50 dark:border-dark-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted">
                          Continue Learning
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 flex-shrink-0">
                          <svg className="w-14 h-14 progress-ring" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-border-subtle dark:text-dark-border" />
                            <circle
                              cx="28" cy="28" r="24" fill="none" stroke="url(#mmGrad)" strokeWidth="4"
                              strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 24}`}
                              strokeDashoffset={`${2 * Math.PI * 24 * (1 - 0.78)}`}
                              className="progress-ring-circle"
                            />
                            <defs>
                              <linearGradient id="mmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#E06438" />
                                <stop offset="100%" stopColor="#F3A45C" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-brand-primary">
                            78%
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text truncate">
                            Python Roadmap
                          </p>
                          <p className="text-xs text-light-textMuted dark:text-dark-muted">78% Complete</p>
                        </div>
                      </div>
                      <button className="mt-3 w-full py-2 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary text-xs font-semibold hover:bg-brand-primary/15 dark:hover:bg-brand-primary/20 transition-all duration-200 flex items-center justify-center gap-1.5">
                        Resume
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="rounded-2xl p-5 bg-light-card dark:bg-dark-card border border-border-subtle/50 dark:border-dark-border/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-brand-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted">
                          Community Stats
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-2.5 rounded-xl bg-light-cardAlt/50 dark:bg-dark-cardAlt/50">
                          <p className="text-lg font-bold text-brand-primary">200+</p>
                          <p className="text-[10px] text-light-textMuted dark:text-dark-muted font-medium">Roadmaps</p>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-light-cardAlt/50 dark:bg-dark-cardAlt/50">
                          <p className="text-lg font-bold text-brand-primary">50K+</p>
                          <p className="text-[10px] text-light-textMuted dark:text-dark-muted font-medium">Learners</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(RoadmapsMegaMenu);
