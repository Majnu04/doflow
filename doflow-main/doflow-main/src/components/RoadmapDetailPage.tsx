import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  FolderGit2,
  Award,
  IndianRupee,
  Target,
  CheckCircle2,
  Users,
  GraduationCap,
  Code2,
  Briefcase,
  FileText,
  MessageCircle,
  Flame,
  ChevronRight,
  Star,
  TrendingUp,
  Sparkles,
  Zap,
  Globe,
  BarChart3,
  Brain,
  Shield,
  Smartphone,
  Palette,
  Rocket,
  Play,
  Lock,
  ArrowRight,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from './ui';
import {
  careerCategories,
  type CareerRoadmap,
  type CareerCategory,
} from '../data/roadmaps';

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
  Globe: LucideIcons.Globe,
};

const getIcon = (name: string) => iconMap[name] || LucideIcons.Circle;

const difficultyConfig: Record<string, { color: string; bg: string; dot: string }> = {
  Beginner: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  Intermediate: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20', dot: 'bg-amber-500' },
  Advanced: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20', dot: 'bg-rose-500' },
};

const findRoadmap = (id: string): { roadmap: CareerRoadmap; category: CareerCategory } | null => {
  for (const cat of careerCategories) {
    const item = cat.items.find((r) => r.id === id);
    if (item) return { roadmap: item, category: cat };
  }
  return null;
};

const sampleModules = (roadmap: CareerRoadmap) => {
  const skills = roadmap.skills.map((s) => s.name);
  const modules = [];
  const coreSkills = skills.filter((_, i) => i < Math.ceil(skills.length / 2));
  const toolSkills = skills.filter((_, i) => i >= Math.ceil(skills.length / 2));

  coreSkills.forEach((skill, i) => {
    modules.push({
      id: `m${i + 1}`,
      title: `${skill} Fundamentals`,
      description: `Master the core concepts of ${skill} including syntax, patterns, and best practices.`,
      lessons: Math.floor(roadmap.lessons / coreSkills.length),
      duration: `${Math.floor(parseInt(roadmap.duration) / coreSkills.length)} weeks`,
      locked: i > 1,
      topics: [
        `Introduction to ${skill}`,
        `${skill} Core Concepts`,
        `${skill} Best Practices`,
        `Hands-on Exercises`,
      ],
    });
  });

  toolSkills.forEach((skill, i) => {
    modules.push({
      id: `m${coreSkills.length + i + 1}`,
      title: `${skill} Mastery`,
      description: `Deep dive into ${skill} for professional-level development.`,
      lessons: Math.floor(roadmap.lessons / (coreSkills.length + toolSkills.length)),
      duration: `${Math.floor(parseInt(roadmap.duration) / (coreSkills.length + toolSkills.length))} weeks`,
      locked: true,
      topics: [
        `${skill} Advanced Features`,
        `Real-world Applications`,
        `Performance Optimization`,
        `Integration Patterns`,
      ],
    });
  });

  return modules;
};

interface RoadmapDetailPageProps {
  roadmapId: string;
}

const RoadmapDetailPage: React.FC<RoadmapDetailPageProps> = ({ roadmapId }) => {
  const data = useMemo(() => findRoadmap(roadmapId), [roadmapId]);
  const modules = useMemo(() => data ? sampleModules(data.roadmap) : [], [data]);

  if (!data) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-[76px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Roadmap not found</h2>
          <p className="text-light-textMuted dark:text-dark-muted mb-6">The roadmap you're looking for doesn't exist.</p>
          <Button variant="primary" size="sm" onClick={() => { window.location.hash = '/roadmaps'; }}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Roadmaps
          </Button>
        </div>
      </div>
    );
  }

  const { roadmap, category } = data;
  const Icon = getIcon(roadmap.icon);
  const dc = difficultyConfig[roadmap.difficulty];

  const timelinePhases = [
    { phase: 'Foundation', weeks: '1-4', description: 'Build core fundamentals', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
    { phase: 'Development', weeks: '5-10', description: 'Hands-on coding practice', icon: Code2, color: 'from-brand-primary to-brand-accent' },
    { phase: 'Projects', weeks: '11-16', description: 'Build real-world projects', icon: FolderGit2, color: 'from-violet-500 to-purple-500' },
    { phase: 'Interview Prep', weeks: '17-20', description: 'Mock interviews & DSA', icon: Target, color: 'from-emerald-500 to-teal-500' },
    { phase: 'Job Ready', weeks: '21-24', description: 'Resume, portfolio & apply', icon: Briefcase, color: 'from-rose-500 to-pink-500' },
  ];

  const sampleProjects = [
    { name: `${roadmap.name} Starter App`, difficulty: 'Beginner', hours: 20 },
    { name: `Intermediate ${roadmap.name} Project`, difficulty: 'Intermediate', hours: 40 },
    { name: `Capstone ${roadmap.name} Application`, difficulty: 'Advanced', hours: 60 },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-[76px]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/[0.04] via-transparent to-transparent dark:from-brand-primary/[0.06]" />
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-brand-primary/[0.04] dark:bg-brand-primary/[0.06] rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-8 sm:pb-12">
          <button
            onClick={() => { window.location.hash = '/roadmaps'; }}
            className="inline-flex items-center gap-2 text-sm text-light-textMuted dark:text-dark-muted hover:text-brand-primary transition-colors mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roadmaps
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-brand-primary/20 dark:to-brand-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-light-text dark:text-dark-text leading-tight">
                    {roadmap.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-muted">{category.title}</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed mb-5 sm:mb-6 max-w-2xl">
                {roadmap.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${dc.bg} ${dc.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dc.dot}`} />
                  {roadmap.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/40 text-light-textSecondary dark:text-dark-textSecondary">
                  <Clock className="w-3.5 h-3.5" />
                  {roadmap.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/40 text-light-textSecondary dark:text-dark-textSecondary">
                  <BookOpen className="w-3.5 h-3.5" />
                  {roadmap.lessons} lessons
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/40 text-light-textSecondary dark:text-dark-textSecondary">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  {roadmap.projects} projects
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-5 sm:mb-6">
                {roadmap.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg border ${
                      skill.level === 'core'
                        ? 'bg-brand-primary/5 dark:bg-brand-primary/10 text-brand-primary border-brand-primary/15 dark:border-brand-primary/20'
                        : skill.level === 'tool'
                        ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/20'
                        : 'bg-light-cardAlt dark:bg-dark-cardAlt text-light-textSecondary dark:text-dark-textSecondary border-border-subtle/40 dark:border-dark-border/40'
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Button variant="primary" size="sm" icon={<Play className="w-4 h-4" />} className="rounded-xl sm:size-md">
                  Start Learning
                </Button>
                <Button variant="outline" size="sm" icon={<Award className="w-4 h-4" />} className="rounded-xl sm:size-md">
                  View Certificate
                </Button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="rounded-[20px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-5 sm:p-6 shadow-lg">
                <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-4">Roadmap Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-primary" /> Duration
                    </span>
                    <span className="text-sm font-bold text-light-text dark:text-dark-text">{roadmap.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand-primary" /> Lessons
                    </span>
                    <span className="text-sm font-bold text-light-text dark:text-dark-text">{roadmap.lessons}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-2">
                      <FolderGit2 className="w-4 h-4 text-brand-primary" /> Projects
                    </span>
                    <span className="text-sm font-bold text-light-text dark:text-dark-text">{roadmap.projects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-2">
                      <Target className="w-4 h-4 text-brand-primary" /> Interview Q&A
                    </span>
                    <span className="text-sm font-bold text-light-text dark:text-dark-text">{roadmap.interviewQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-primary" /> Certificate
                    </span>
                    <span className="text-sm font-bold text-emerald-500">Included</span>
                  </div>
                  <div className="pt-3 border-t border-border-subtle/40 dark:border-dark-border/40">
                    <p className="text-[10px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted mb-1">India Salary</p>
                    <p className="text-lg font-bold text-light-text dark:text-dark-text">{roadmap.salary.india}</p>
                    <p className="text-[10px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted mt-2 mb-1">Global Salary</p>
                    <p className="text-lg font-bold text-light-text dark:text-dark-text">{roadmap.salary.global}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Learning Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Learning Timeline</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-primary/20 via-brand-primary/40 to-brand-primary/20 hidden sm:block" />
            <div className="space-y-6">
              {timelinePhases.map((phase, i) => {
                const PhaseIcon = phase.icon;
                return (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 sm:gap-6"
                  >
                    <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <PhaseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 rounded-[16px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-4 hover:border-brand-primary/20 dark:hover:border-brand-primary/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-light-text dark:text-dark-text">{phase.phase}</h4>
                          <p className="text-xs text-light-textMuted dark:text-dark-muted">{phase.description}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 px-2.5 py-1 rounded-full">
                          Weeks {phase.weeks}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Prerequisites */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Prerequisites</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Basic Computer Skills', desc: 'Comfortable with using a computer and internet' },
              { title: 'English Reading', desc: 'Ability to read English documentation' },
              { title: `${roadmap.difficulty === 'Beginner' ? 'No coding experience needed' : 'Basic programming knowledge'}`, desc: roadmap.difficulty === 'Beginner' ? 'We start from the very basics' : 'Variables, loops, functions, and basic data structures' },
            ].map((prereq) => (
              <div key={prereq.title} className="flex items-start gap-3 p-3.5 sm:p-4 rounded-[16px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">{prereq.title}</p>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted">{prereq.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Interactive Roadmap Graph */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Map className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Roadmap Overview</h2>
          </div>
          <div className="rounded-[20px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-4 sm:p-8 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max">
              {roadmap.skills.map((skill, i) => (
                <React.Fragment key={skill.name}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${
                      skill.level === 'core'
                        ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                        : skill.level === 'tool'
                        ? 'bg-violet-50 dark:bg-violet-500/10 border-violet-300 dark:border-violet-500/30 text-violet-500'
                        : 'bg-light-cardAlt dark:bg-dark-cardAlt border-border-subtle dark:border-dark-border text-light-textMuted dark:text-dark-muted'
                    }`}>
                      <Code2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-light-text dark:text-dark-text text-center max-w-[80px]">
                      {skill.name}
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-bold ${
                      skill.level === 'core' ? 'text-brand-primary' : skill.level === 'tool' ? 'text-violet-500' : 'text-light-textMuted dark:text-dark-muted'
                    }`}>
                      {skill.level}
                    </span>
                  </div>
                  {i < roadmap.skills.length - 1 && (
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 bg-gradient-to-r from-brand-primary/30 to-brand-primary/10" />
                      <ChevronRight className="w-4 h-4 text-brand-primary/30 -ml-1" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Modules */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Modules</h2>
            <span className="text-xs font-medium text-light-textMuted dark:text-dark-muted ml-2">{modules.length} modules</span>
          </div>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={`rounded-[16px] border p-4 sm:p-5 transition-all ${
                  mod.locked
                    ? 'bg-white/50 dark:bg-dark-card/50 border-border-subtle/30 dark:border-dark-border/30 opacity-70'
                    : 'bg-white dark:bg-dark-card border-border-subtle/60 dark:border-dark-border/60 hover:border-brand-primary/20 dark:hover:border-brand-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      mod.locked
                        ? 'bg-light-cardAlt dark:bg-dark-cardAlt'
                        : 'bg-brand-primary/10 dark:bg-brand-primary/15'
                    }`}>
                      {mod.locked ? (
                        <Lock className="w-4 h-4 text-light-textMuted dark:text-dark-muted" />
                      ) : (
                        <span className="text-sm font-bold text-brand-primary">{i + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-light-text dark:text-dark-text">{mod.title}</h4>
                      <p className="text-xs text-light-textMuted dark:text-dark-muted mt-0.5">{mod.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-medium text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {mod.lessons} lessons
                        </span>
                        <span className="text-[10px] font-medium text-light-textSecondary dark:text-dark-textSecondary flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {mod.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!mod.locked && (
                    <Button variant="soft" size="xs" className="rounded-lg text-xs">
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {!mod.locked && (
                  <div className="mt-3 ml-12 sm:ml-13 pl-[44px] sm:pl-[52px]">
                    <div className="flex flex-wrap gap-1.5">
                      {mod.topics.map((topic) => (
                        <span key={topic} className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-light-cardAlt dark:bg-dark-cardAlt text-light-textSecondary dark:text-dark-textSecondary border border-border-subtle/30 dark:border-dark-border/30">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Projects */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Projects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleProjects.map((proj, i) => {
              const pdc = difficultyConfig[proj.difficulty];
              return (
                <motion.div
                  key={proj.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="rounded-[16px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-4 sm:p-5 hover:border-brand-primary/20 dark:hover:border-brand-primary/20 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 dark:from-brand-primary/20 dark:to-brand-accent/20 flex items-center justify-center">
                      <FolderGit2 className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${pdc.bg} ${pdc.color}`}>
                      {proj.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-light-text dark:text-dark-text mb-1">{proj.name}</h4>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {proj.hours} hours
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Mock Interviews */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-light-text dark:text-dark-text">Mock Interviews</h2>
          </div>
          <div className="rounded-[20px] bg-gradient-to-br from-brand-primary to-brand-accent p-[1px]">
            <div className="rounded-[19px] bg-white dark:bg-dark-card p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-brand-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text mb-1">
                    {roadmap.interviewQuestions}+ Interview Questions
                  </h3>
                  <p className="text-sm text-light-textMuted dark:text-dark-muted">
                    Practice with curated interview questions from top companies. Includes coding challenges, system design, and behavioral questions.
                  </p>
                </div>
                <Button variant="primary" size="sm" className="rounded-xl flex-shrink-0">
                  Practice Now
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Resume Guide & Job Preparation */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-[16px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-5 sm:p-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-2">Resume Guide</h3>
              <p className="text-xs text-light-textMuted dark:text-dark-muted mb-4">
                Build a compelling resume that highlights your {roadmap.name} skills and projects.
              </p>
              <Button variant="soft" size="xs" className="rounded-lg text-xs">
                View Guide <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="rounded-[16px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-5 sm:p-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-2">Job Preparation</h3>
              <p className="text-xs text-light-textMuted dark:text-dark-muted mb-4">
                Complete job preparation kit with salary negotiation tips and interview strategies.
              </p>
              <Button variant="soft" size="xs" className="rounded-lg text-xs">
                View Guide <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Community Discussion */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-16"
        >
          <div className="rounded-[20px] bg-white dark:bg-dark-card border border-border-subtle/60 dark:border-dark-border/60 p-6 sm:p-8 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/15 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-brand-primary" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text mb-2">Community Discussion</h3>
            <p className="text-xs sm:text-sm text-light-textMuted dark:text-dark-muted max-w-md mx-auto mb-4 sm:mb-5">
              Join thousands of learners discussing {roadmap.name} concepts, sharing projects, and helping each other.
            </p>
            <Button variant="primary" size="sm" icon={<MessageCircle className="w-4 h-4" />} className="rounded-xl">
              Join Discussion
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

const Map: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

export default React.memo(RoadmapDetailPage);
