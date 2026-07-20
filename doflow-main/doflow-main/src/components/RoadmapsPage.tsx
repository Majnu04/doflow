import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Search,
  TrendingUp,
  Clock,
  BookOpen,
  FolderGit2,
  Award,
  IndianRupee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
  Filter,
  X,
  Building2,
  Globe,
  Brain,
  Container,
  BarChart3,
  Shield,
  Smartphone,
  Code2,
  Palette,
  Rocket,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  Target,
  GraduationCap,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from './ui';
import {
  careerCategories,
  featuredCareers,
  filterOptions,
  trendingSearches,
  type CareerRoadmap,
  type CareerCategory,
  type FilterId,
  type FeaturedCareer,
} from '../data/roadmaps';

const categoryIconMap: Record<string, React.FC<{ className?: string }>> = {
  Globe, Brain, Container, BarChart3, Shield, Smartphone,
  Code2, Palette, Rocket, Layers: LucideIcons.Layers, Network: LucideIcons.Network,
  Briefcase: LucideIcons.Briefcase, Cloud: LucideIcons.Cloud, Terminal: LucideIcons.Terminal,
  Boxes: LucideIcons.Boxes, Activity: LucideIcons.Activity, Ship: LucideIcons.Ship,
  Cpu: LucideIcons.Cpu, Link: LucideIcons.Link, Wifi: LucideIcons.Wifi,
  Gamepad2: LucideIcons.Gamepad2, CheckCircle2: LucideIcons.CheckCircle2,
  TestTube: LucideIcons.TestTube, Binary: LucideIcons.Binary, Figma: LucideIcons.Figma,
  Paintbrush: LucideIcons.Paintbrush,
};

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Monitor: LucideIcons.Monitor, Server: LucideIcons.Server, Layers: LucideIcons.Layers,
  Atom: LucideIcons.Atom, Triangle: LucideIcons.Triangle, Hexagon: LucideIcons.Hexagon,
  Zap: LucideIcons.Zap, Terminal: LucideIcons.Terminal, Stack: LucideIcons.Stack,
  Briefcase: LucideIcons.Briefcase, Coffee: LucideIcons.Coffee, Code2: LucideIcons.Code2,
  Cpu: LucideIcons.Cpu, Network: LucideIcons.Network, Brain: LucideIcons.Brain,
  Workflow: LucideIcons.Workflow, MessageSquare: LucideIcons.MessageSquare,
  Sparkles: LucideIcons.Sparkles, Eye: LucideIcons.Eye, Languages: LucideIcons.Languages,
  GitBranch: LucideIcons.GitBranch, BarChart3: LucideIcons.BarChart3,
  PieChart: LucideIcons.PieChart, Database: LucideIcons.Database,
  TrendingUp: LucideIcons.TrendingUp, GitMerge: LucideIcons.GitMerge,
  Container: LucideIcons.Container, Cloud: LucideIcons.Cloud, Boxes: LucideIcons.Boxes,
  Activity: LucideIcons.Activity, Ship: LucideIcons.Ship, Shield: LucideIcons.Shield,
  Bug: LucideIcons.Bug, Crosshair: LucideIcons.Crosshair, ShieldCheck: LucideIcons.ShieldCheck,
  Smartphone: LucideIcons.Smartphone, Layout: LucideIcons.Layout,
  Binary: LucideIcons.Binary, Palette: LucideIcons.Palette, Paintbrush: LucideIcons.Paintbrush,
  Users: LucideIcons.Users, Figma: LucideIcons.Figma, Rocket: LucideIcons.Rocket,
  Link: LucideIcons.Link, Gamepad2: LucideIcons.Gamepad2, Wifi: LucideIcons.Wifi,
  CheckCircle2: LucideIcons.CheckCircle2, TestTube: LucideIcons.TestTube,
};

const getIcon = (name: string) => iconMap[name] || LucideIcons.Circle;
const getCategoryIcon = (name: string) => categoryIconMap[name] || LucideIcons.Circle;

const difficultyConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Beginner: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  Intermediate: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20', dot: 'bg-amber-500' },
  Advanced: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20', dot: 'bg-rose-500' },
};

const categoryFilterMap: Record<FilterId, string[]> = {
  'all': [],
  'web-dev': ['web-dev'],
  'ai-ml': ['ai-ml'],
  'cloud': ['cloud-devops'],
  'data': ['data-analytics'],
  'security': ['cyber-security'],
  'mobile': ['mobile-dev'],
  'beginner': [],
  'intermediate': [],
  'advanced': [],
  'trending': [],
  'newest': [],
};

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const navigateToRoadmap = (id: string) => {
  window.location.hash = `/roadmaps/${id}`;
};

const ProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({
  percentage,
  size = 44,
  strokeWidth = 3,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-brand-primary/10 dark:text-brand-primary/5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-brand-primary transition-all duration-700"
      />
    </svg>
  );
};

const FeaturedCard: React.FC<{ career: FeaturedCareer; index: number }> = ({ career, index }) => {
  const Icon = getIcon(career.icon);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex-shrink-0 w-[85vw] sm:w-[420px] group cursor-pointer"
      onClick={() => navigateToRoadmap(career.roadmapId)}
    >
      <div className={`relative overflow-hidden rounded-[24px] bg-gradient-to-br ${career.gradient} p-[1px] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
        <div className="relative bg-white dark:bg-[#0F172A] rounded-[23px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative p-5 sm:p-7">
            <div className="flex items-start justify-between mb-5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${career.gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyConfig[career.difficulty].bg} ${difficultyConfig[career.difficulty].color}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${difficultyConfig[career.difficulty].dot} mr-1.5`} />
                {career.difficulty}
              </div>
            </div>

            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">{career.title}</h3>
            <p className="text-sm text-light-textMuted dark:text-dark-muted leading-relaxed mb-5">{career.subtitle}</p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {career.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt text-light-textSecondary dark:text-dark-textSecondary border border-border-subtle/50 dark:border-dark-border/50"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 sm:mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-light-text dark:text-dark-text font-bold text-sm mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-brand-primary" />
                  {career.duration}
                </div>
                <span className="text-[10px] text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Duration</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-light-text dark:text-dark-text font-bold text-sm mb-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-primary" />
                  {career.lessons}
                </div>
                <span className="text-[10px] text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Lessons</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-light-text dark:text-dark-text font-bold text-sm mb-0.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-brand-primary" />
                  {career.projects}
                </div>
                <span className="text-[10px] text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Projects</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-light-text dark:text-dark-text font-bold text-sm mb-0.5">
                  <Users className="w-3.5 h-3.5 text-brand-primary" />
                  {career.jobOpenings}
                </div>
                <span className="text-[10px] text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Jobs</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-0.5">Avg. Salary</p>
                <p className="text-sm font-bold text-light-text dark:text-dark-text">{career.salary.india}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="rounded-xl"
              >
                {career.buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RoadmapCard: React.FC<{ item: CareerRoadmap; index: number }> = ({ item, index }) => {
  const Icon = getIcon(item.icon);
  const dc = difficultyConfig[item.difficulty];
  const percentage = Math.min(95, Math.max(15, item.lessons * 0.5));

  return (
    <motion.div
      variants={fadeInUp}
      transition={{ duration: 0.4 }}
      className="group cursor-pointer"
      onClick={() => navigateToRoadmap(item.id)}
    >
      <div className="relative h-full rounded-[20px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/20 dark:hover:border-brand-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/[0.03] via-transparent to-brand-accent/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-brand-primary/20 dark:to-brand-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-brand-primary" />
              </div>
              {item.trending && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                  <Flame className="w-3 h-3 text-white" />
                </span>
              )}
              {item.isNew && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-[8px] font-bold text-white shadow-sm">
                  NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ProgressRing percentage={percentage} size={38} strokeWidth={2.5} />
            </div>
          </div>

          <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-2 group-hover:text-brand-primary transition-colors duration-200">
            {item.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${dc.bg} ${dc.color}`}>
              <span className={`w-1 h-1 rounded-full ${dc.dot}`} />
              {item.difficulty}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-light-textMuted dark:text-dark-muted">
              <Clock className="w-3 h-3" />
              {item.duration}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-3 text-[11px] text-light-textSecondary dark:text-dark-textSecondary">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-brand-primary/70" />
              {item.lessons} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <FolderGit2 className="w-3 h-3 text-brand-primary/70" />
              {item.projects} projects
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {item.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.name}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-light-cardAlt dark:bg-dark-cardAlt text-light-textSecondary dark:text-dark-textSecondary border border-border-subtle/40 dark:border-dark-border/40"
              >
                {skill.name}
              </span>
            ))}
            {item.skills.length > 4 && (
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-brand-primary/5 text-brand-primary">
                +{item.skills.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40 dark:border-dark-border/40">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-0.5">India Salary</p>
              <p className="text-xs font-bold text-light-text dark:text-dark-text">{item.salary.india}</p>
            </div>
            <Button
              variant="soft"
              size="xs"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="rounded-lg text-xs"
            >
              View Roadmap
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CategorySection: React.FC<{ category: CareerCategory }> = ({ category }) => {
  const CatIcon = getCategoryIcon(category.icon);
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className="mb-10 sm:mb-16"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-brand-primary/20 dark:to-brand-accent/20 flex items-center justify-center">
          <CatIcon className="w-5 h-5 text-brand-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">{category.title}</h2>
            {category.badge && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                category.badge === 'TRENDING'
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20'
                  : category.badge === 'HOT'
                  ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20'
                  : 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-500/20'
              }`}>
                {category.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-light-textMuted dark:text-dark-muted">{category.description}</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-40px' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6"
      >
        {category.items.map((item, i) => (
          <RoadmapCard key={item.id} item={item} index={i} />
        ))}
      </motion.div>
    </motion.section>
  );
};

const RoadmapsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featuredRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const filteredCategories = useMemo(() => {
    let categories = [...careerCategories];

    const filterCatIds = categoryFilterMap[activeFilter];
    if (filterCatIds.length > 0) {
      categories = categories.filter((cat) => filterCatIds.includes(cat.id));
    }

    if (activeFilter === 'beginner' || activeFilter === 'intermediate' || activeFilter === 'advanced') {
      const diff = activeFilter === 'beginner' ? 'Beginner' : activeFilter === 'intermediate' ? 'Intermediate' : 'Advanced';
      categories = categories
        .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.difficulty === diff) }))
        .filter((cat) => cat.items.length > 0);
    }

    if (activeFilter === 'trending') {
      categories = categories
        .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.trending) }))
        .filter((cat) => cat.items.length > 0);
    }

    if (activeFilter === 'newest') {
      categories = categories
        .map((cat) => ({ ...cat, items: cat.items.filter((item) => item.isNew) }))
        .filter((cat) => cat.items.length > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      categories = categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              item.skills.some((s) => s.name.toLowerCase().includes(q)) ||
              item.description.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.items.length > 0);
    }

    return categories;
  }, [searchQuery, activeFilter]);

  const totalRoadmaps = useMemo(
    () => filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0),
    [filteredCategories]
  );

  const scrollFeatured = useCallback((direction: 'left' | 'right') => {
    if (!featuredRef.current) return;
    const scrollAmount = 440;
    featuredRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredCareers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-[76px]">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.04] via-transparent to-transparent dark:from-brand-primary/[0.06]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-primary/[0.04] dark:bg-brand-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-brand-accent/[0.04] dark:bg-brand-accent/[0.06] rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/15 text-brand-primary text-xs font-semibold mb-6 border border-brand-primary/10 dark:border-brand-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              Career Roadmaps
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-light-text dark:text-dark-text leading-tight mb-4 sm:mb-5">
              Find Your{' '}
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                Dream Tech
              </span>{' '}
              Career
            </h1>

            <p className="text-sm sm:text-lg text-light-textMuted dark:text-dark-muted leading-relaxed max-w-2xl mx-auto px-2 sm:px-0">
              Choose a career path and follow a structured roadmap designed by industry experts.
              Learn step-by-step, build projects, prepare for interviews, and become job-ready.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto mb-6 sm:mb-8 px-2 sm:px-0"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary/20 via-brand-accent/20 to-brand-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative flex items-center bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 rounded-2xl shadow-lg shadow-brand-primary/5 dark:shadow-none overflow-hidden">
                <Search className="w-5 h-5 text-light-textMuted dark:text-dark-muted ml-4 sm:ml-5 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search careers..."
                  className="flex-1 px-3 sm:px-4 py-3.5 sm:py-4 text-sm bg-transparent outline-none text-light-text dark:text-dark-text placeholder:text-light-textMuted/60 dark:placeholder:text-dark-muted/60 min-w-0"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mr-2 sm:mr-3 p-1.5 rounded-lg hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-light-textMuted dark:text-dark-muted" />
                  </button>
                )}
                <div className="mr-3 sm:mr-4 flex-shrink-0">
                  <Button variant="primary" size="sm" className="rounded-xl">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trending Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto px-2 sm:px-0"
          >
            <span className="text-xs text-light-textMuted dark:text-dark-muted font-medium mr-1">
              <TrendingUp className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
              Trending:
            </span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 text-light-textSecondary dark:text-dark-textSecondary hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Roadmaps Carousel */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-brand-primary" />
                <h2 className="text-lg sm:text-2xl font-bold text-light-text dark:text-dark-text">Featured Roadmaps</h2>
              </div>
              <p className="text-sm text-light-textMuted dark:text-dark-muted">Most popular career paths chosen by our learners</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollFeatured('left')}
                className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 flex items-center justify-center hover:border-brand-primary/40 hover:text-brand-primary transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollFeatured('right')}
                className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 flex items-center justify-center hover:border-brand-primary/40 hover:text-brand-primary transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={featuredRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredCareers.map((career, i) => (
              <div key={career.id} className="snap-start">
                <FeaturedCard career={career} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[76px] z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl border-y border-border-subtle/40 dark:border-dark-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Filter className="w-4 h-4 text-light-textMuted dark:text-dark-muted flex-shrink-0" />
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-full transition-all duration-200 ${
                  activeFilter === filter.id
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25'
                    : 'bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 text-light-textSecondary dark:text-dark-textSecondary hover:border-brand-primary/40 hover:text-brand-primary'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Career Categories */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-10">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-light-text dark:text-dark-text mb-1">Career Roadmaps</h2>
              <p className="text-sm text-light-textMuted dark:text-dark-muted">
                {totalRoadmaps} career paths across {filteredCategories.length} categories
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {filteredCategories.length > 0 ? (
              <motion.div
                key={activeFilter + searchQuery}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredCategories.map((category) => (
                  <CategorySection key={category.id} category={category} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">No careers found</h3>
                <p className="text-sm text-light-textMuted dark:text-dark-muted mb-6 max-w-md mx-auto">
                  We couldn't find any career paths matching your search. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilter('all');
                  }}
                  icon={<X className="w-4 h-4" />}
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-10 sm:py-16 border-t border-border-subtle/40 dark:border-dark-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted font-semibold mb-6 sm:mb-8">
            Our learners work at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8">
            {[
              { name: 'Google', icon: 'G' },
              { name: 'Microsoft', icon: 'M' },
              { name: 'Amazon', icon: 'A' },
              { name: 'Meta', icon: 'M' },
              { name: 'Adobe', icon: 'A' },
              { name: 'Netflix', icon: 'N' },
              { name: 'Uber', icon: 'U' },
              { name: 'Atlassian', icon: 'A' },
              { name: 'Oracle', icon: 'O' },
              { name: 'Zoho', icon: 'Z' },
            ].map((company) => (
              <div
                key={company.name}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white dark:bg-dark-card border border-border-subtle/40 dark:border-dark-border/40 hover:border-brand-primary/30 transition-colors duration-200"
              >
                <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-[9px] sm:text-xs font-bold">
                  {company.icon}
                </span>
                <span className="text-[11px] sm:text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(RoadmapsPage);
