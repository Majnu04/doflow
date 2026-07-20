import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Search,
  X,
  ArrowRight,
  Clock,
  BookOpen,
  FolderOpen,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Filter,
  Users,
  Star,
  BarChart3,
  CheckCircle,
  Timer,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  topCategories,
  secondRowCategories,
  featuredRoadmaps,
  popularCompanies,
  trendingSearches,
  filterOptions,
  type RoadmapItem,
  type RoadmapCategory,
  type RoadmapBadge,
  type Difficulty,
  type FilterId,
} from '../data/roadmaps';

const iconMap: Record<string, React.FC<{ className?: string; strokeWidth?: number }>> = {
  Code2: LucideIcons.Code2,
  Coffee: LucideIcons.Coffee,
  FileCode2: LucideIcons.FileCode2,
  FileCode: LucideIcons.FileCode,
  Terminal: LucideIcons.Terminal,
  Wrench: LucideIcons.Wrench,
  Zap: LucideIcons.Zap,
  Smartphone: LucideIcons.Smartphone,
  Target: LucideIcons.Target,
  Globe: LucideIcons.Globe,
  Palette: LucideIcons.Palette,
  Wind: LucideIcons.Wind,
  Layout: LucideIcons.Layout,
  Atom: LucideIcons.Atom,
  Triangle: LucideIcons.Triangle,
  Leaf: LucideIcons.Leaf,
  Hexagon: LucideIcons.Hexagon,
  Flame: LucideIcons.Flame,
  RefreshCw: LucideIcons.RefreshCw,
  Play: LucideIcons.Play,
  Eye: LucideIcons.Eye,
  Server: LucideIcons.Server,
  FlaskConical: LucideIcons.FlaskConical,
  Link: LucideIcons.Link,
  GitBranch: LucideIcons.GitBranch,
  Lock: LucideIcons.Lock,
  Boxes: LucideIcons.Boxes,
  Radio: LucideIcons.Radio,
  Brain: LucideIcons.Brain,
  Network: LucideIcons.Network,
  Box: LucideIcons.Box,
  MessageSquare: LucideIcons.MessageSquare,
  Sparkles: LucideIcons.Sparkles,
  PenTool: LucideIcons.PenTool,
  Cpu: LucideIcons.Cpu,
  Bot: LucideIcons.Bot,
  BookOpen: LucideIcons.BookOpen,
  Plug: LucideIcons.Plug,
  Cloud: LucideIcons.Cloud,
  Container: LucideIcons.Container,
  Settings: LucideIcons.Settings,
  Activity: LucideIcons.Activity,
  Database: LucideIcons.Database,
  Snowflake: LucideIcons.Snowflake,
  Search: LucideIcons.Search,
  Shield: LucideIcons.Shield,
  Wifi: LucideIcons.Wifi,
  Bug: LucideIcons.Bug,
  Monitor: LucideIcons.Monitor,
  KeyRound: LucideIcons.KeyRound,
  ShieldCheck: LucideIcons.ShieldCheck,
  Rocket: LucideIcons.Rocket,
  Binary: LucideIcons.Binary,
  Trophy: LucideIcons.Trophy,
  LayoutGrid: LucideIcons.LayoutGrid,
  FileText: LucideIcons.FileText,
  Users: LucideIcons.Users,
  MessageCircle: LucideIcons.MessageCircle,
  Mic: LucideIcons.Mic,
  Calculator: LucideIcons.Calculator,
  MessagesSquare: LucideIcons.MessagesSquare,
  Layers: LucideIcons.Layers,
  BarChart3: LucideIcons.BarChart3,
  BrainCircuit: LucideIcons.BrainCircuit,
  Gamepad2: LucideIcons.Gamepad2,
  Link2: LucideIcons.Link2,
  CheckCircle: LucideIcons.CheckCircle,
  ArrowRight: LucideIcons.ArrowRight,
  ArrowUpRight: LucideIcons.ArrowUpRight,
  Timer: LucideIcons.Timer,
  Clock: LucideIcons.Clock,
  FolderOpen: LucideIcons.FolderOpen,
};

const getIcon = (name: string) => iconMap[name] || LucideIcons.Circle;

const badgeStyles: Record<RoadmapBadge, string> = {
  NEW: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
  TRENDING: 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20',
  POPULAR: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
  UPDATED: 'bg-violet-50 text-violet-700 border border-violet-200/60 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/20',
  HOT: 'bg-rose-50 text-rose-700 border border-rose-200/60 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20',
};

const difficultyStyles: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Intermediate: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Advanced: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

const difficultyDots: Record<Difficulty, string> = {
  Beginner: 'bg-emerald-500',
  Intermediate: 'bg-amber-500',
  Advanced: 'bg-rose-500',
};

const Badge: React.FC<{ badge: RoadmapBadge }> = ({ badge }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${badgeStyles[badge]}`}>
    {badge}
  </span>
);

const DifficultyBadge: React.FC<{ level: Difficulty }> = ({ level }) => (
  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${difficultyStyles[level]}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${difficultyDots[level]}`} />
    {level}
  </span>
);

const RoadmapCard: React.FC<{ item: RoadmapItem; index: number }> = ({ item, index }) => {
  const Icon = getIcon(item.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative bg-light-card dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-card-hover dark:hover:shadow-dark-lg hover:border-brand-primary/30 dark:hover:border-brand-primary/30"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/8 dark:bg-brand-primary/12 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <Icon className="w-5 h-5 text-brand-primary" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-light-text dark:text-dark-text group-hover:text-brand-primary dark:group-hover:text-brand-primary transition-colors duration-200">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <DifficultyBadge level={item.difficulty} />
              {item.badge && <Badge badge={item.badge} />}
            </div>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-light-textMuted dark:text-dark-muted opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      </div>

      <div className="flex items-center gap-4 mb-3 text-[11px] text-light-textMuted dark:text-dark-muted font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {item.duration}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {item.lessons} Lessons
        </span>
        <span className="flex items-center gap-1">
          <FolderOpen className="w-3 h-3" />
          {item.projects} Projects
        </span>
      </div>

      {item.progress !== undefined && item.progress > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-light-textMuted dark:text-dark-muted">{item.progress}% Complete</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-border-subtle/60 dark:bg-dark-border/60 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.progress}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-accent"
            />
          </div>
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 0 0 1px rgba(224, 100, 56, 0.15), 0 8px 32px rgba(224, 100, 56, 0.06)' }}
      />
    </motion.div>
  );
};

const FeaturedCard: React.FC<{ roadmap: typeof featuredRoadmaps[0]; index: number }> = ({ roadmap, index }) => {
  const Icon = getIcon(roadmap.icon);
  const gradients = [
    'from-brand-primary to-brand-accent',
    'from-violet-500 to-purple-400',
    'from-blue-500 to-cyan-400',
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradients[index % 3]} p-6 text-white cursor-pointer min-w-[300px] flex-shrink-0`}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 opacity-80" />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Featured Roadmap</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-5 h-5" strokeWidth={1.8} />
          </div>
          <div>
            <h3 className="text-lg font-bold">{roadmap.title}</h3>
            <DifficultyBadge level={roadmap.difficulty} />
          </div>
        </div>
        <p className="text-sm opacity-85 mb-5 leading-relaxed">{roadmap.subtitle}</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {roadmap.stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 opacity-70" />
              <span className="text-xs font-medium opacity-90">{stat.value} {stat.label}</span>
            </div>
          ))}
        </div>

        <button className="w-full py-2.5 rounded-xl bg-white text-brand-primary text-sm font-bold hover:bg-white/90 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
          {roadmap.buttonText}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
    </motion.div>
  );
};

const CategorySection: React.FC<{ category: RoadmapCategory; sectionIndex: number }> = ({ category, sectionIndex }) => {
  const SectionIcon = getIcon(category.icon);
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: sectionIndex * 0.08 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-brand-primary/8 dark:bg-brand-primary/12 flex items-center justify-center">
          <SectionIcon className="w-4 h-4 text-brand-primary" strokeWidth={2} />
        </div>
        <h2 className="text-lg font-bold text-light-text dark:text-dark-text tracking-tight">{category.title}</h2>
        {category.badge && <Badge badge={category.badge} />}
        <span className="text-xs font-medium text-light-textMuted dark:text-dark-muted bg-light-cardAlt dark:bg-dark-cardAlt px-2 py-0.5 rounded-full ml-1">
          {category.items.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {category.items.map((item, i) => (
          <RoadmapCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </motion.section>
  );
};

const RoadmapsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const allCategories = useMemo(() => [...topCategories, ...secondRowCategories], []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const matchesSearch = !q || item.name.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q);
          let matchesFilter = true;
          if (activeFilter === 'beginner') matchesFilter = item.difficulty === 'Beginner';
          else if (activeFilter === 'intermediate') matchesFilter = item.difficulty === 'Intermediate';
          else if (activeFilter === 'advanced') matchesFilter = item.difficulty === 'Advanced';
          else if (activeFilter === 'trending') matchesFilter = item.badge === 'TRENDING';
          else if (activeFilter === 'new') matchesFilter = item.badge === 'NEW';
          return matchesSearch && matchesFilter;
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [allCategories, searchQuery, activeFilter]);

  const totalResults = useMemo(
    () => filteredCategories.reduce((sum, cat) => sum + cat.items.length, 0),
    [filteredCategories]
  );

  const handleFilterClick = useCallback((id: FilterId) => {
    setActiveFilter(id);
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/4 dark:from-brand-primary/6 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/8 dark:bg-brand-primary/12 text-brand-primary text-xs font-semibold mb-4 border border-brand-primary/15">
              <Sparkles className="w-3.5 h-3.5" />
              200+ Structured Learning Paths
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text tracking-tight mb-4 leading-tight">
              Explore Career{' '}
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                Roadmaps
              </span>
            </h1>
            <p className="text-base sm:text-lg text-light-textSecondary dark:text-dark-textSecondary leading-relaxed max-w-xl mx-auto">
              Choose your learning journey and become job-ready with structured, project-based learning paths.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Sticky Search & Filters */}
      <div className="sticky top-[76px] z-30 bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-xl border-b border-border-subtle/40 dark:border-dark-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-textMuted dark:text-dark-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 200+ roadmaps..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-light-card dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 rounded-xl text-light-text dark:text-dark-text placeholder-light-textMuted/60 dark:placeholder-dark-muted/60 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-light-textMuted dark:text-dark-muted" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    activeFilter === filter.id
                      ? 'bg-brand-primary text-white shadow-brand'
                      : 'bg-light-card dark:bg-dark-card text-light-textMuted dark:text-dark-muted border border-border-subtle/60 dark:border-dark-border/60 hover:border-brand-primary/30 hover:text-brand-primary dark:hover:text-brand-primary'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Count */}
          {(searchQuery || activeFilter !== 'all') && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs font-medium text-light-textMuted dark:text-dark-muted"
            >
              {totalResults} roadmap{totalResults !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {activeFilter !== 'all' && ` in ${activeFilter}`}
            </motion.p>
          )}

          {/* Trending Chips (show when no search/filter) */}
          {!searchQuery && activeFilter === 'all' && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending:
              </span>
              {trendingSearches.slice(0, 6).map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-light-card dark:bg-dark-card text-light-textSecondary dark:text-dark-textSecondary border border-border-subtle/40 dark:border-dark-border/40 hover:border-brand-primary/30 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-180"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Section */}
        {activeFilter === 'all' && !searchQuery && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary/8 dark:bg-brand-primary/12 flex items-center justify-center">
                <Star className="w-4 h-4 text-brand-primary" strokeWidth={2} />
              </div>
              <h2 className="text-lg font-bold text-light-text dark:text-dark-text tracking-tight">Featured Roadmaps</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {featuredRoadmaps.map((rm, i) => (
                <FeaturedCard key={rm.id} roadmap={rm} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        <div className="flex flex-col gap-10">
          <AnimatePresence mode="wait">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, i) => (
                <CategorySection key={cat.id} category={cat} sectionIndex={i} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-2xl bg-light-cardAlt dark:bg-dark-cardAlt flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-light-textMuted dark:text-dark-muted" />
                </div>
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">No roadmaps found</h3>
                <p className="text-sm text-light-textMuted dark:text-dark-muted">
                  Try adjusting your search or filters.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Companies Section */}
        {activeFilter === 'all' && !searchQuery && (
          <section className="mt-14 border-t border-border-subtle/40 dark:border-dark-border/40 pt-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-5 text-center">
              Roadmaps used by developers preparing for
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
              {popularCompanies.map((company) => (
                <div
                  key={company.name}
                  className="flex items-center gap-2.5 opacity-35 hover:opacity-100 transition-all duration-300 grayscale hover:grayscale-0 cursor-default"
                >
                  <div className="w-8 h-8 rounded-lg bg-light-card dark:bg-dark-card border border-border-subtle/50 dark:border-dark-border/50 flex items-center justify-center shadow-xs">
                    <span className="text-[11px] font-bold text-light-textSecondary dark:text-dark-textSecondary">
                      {company.letter}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-light-textSecondary dark:text-dark-textSecondary">
                    {company.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default React.memo(RoadmapsPage);
