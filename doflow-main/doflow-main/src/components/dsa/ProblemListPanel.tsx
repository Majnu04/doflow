import React, { useState, useMemo, useCallback } from 'react';
import {
  FiSearch, FiChevronDown, FiChevronRight, FiCheckCircle, FiCircle,
  FiClock, FiStar, FiBookOpen, FiTarget, FiTrendingUp, FiZap,
  FiFilter, FiBookmark, FiBarChart2, FiAward, FiLayers, FiHeart,
} from 'react-icons/fi';
import { Virtuoso } from 'react-virtuoso';

interface Section {
  _id: string;
  title: string;
  order?: number;
}

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  section?: string;
  isPremium?: boolean;
  tags?: string[];
}

interface ProblemListPanelProps {
  sections: Section[];
  problems: Problem[];
  activeProblemId: string | null;
  solvedProblemIds: Set<string>;
  sectionSolvedCounts: Record<string, { solved: number; total: number }>;
  solvedCount?: number;
  totalCount?: number;
  progressPercentage?: number;
  currentStreak?: number;
  onProblemSelect: (problem: Problem) => void;
  onSectionChange: (sectionId: string) => void;
  activeSectionId: string | null;
  isEnrolled?: boolean;
}

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { value: 'hard', label: 'Hard', color: 'text-red-500', bg: 'bg-red-500/10' },
];

const RECENT_PROBLEMS_LIMIT = 5;

const ProblemListPanel: React.FC<ProblemListPanelProps> = ({
  sections,
  problems,
  activeProblemId,
  solvedProblemIds,
  sectionSolvedCounts,
  solvedCount = 0,
  totalCount = 0,
  progressPercentage = 0,
  currentStreak = 0,
  onProblemSelect,
  onSectionChange,
  activeSectionId,
  isEnrolled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showBookmarked, setShowBookmarked] = useState(false);

  const filteredProblems = useMemo(() => {
    let filtered = problems;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedDifficulty) {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }
    return filtered;
  }, [problems, searchQuery, selectedDifficulty]);

  const groupedBySection = useMemo(() => {
    const groups: Record<string, Problem[]> = {};
    filteredProblems.forEach(p => {
      const sid = p.section || 'uncategorized';
      if (!activeSectionId || p.section === activeSectionId) {
        if (!groups[sid]) groups[sid] = [];
        groups[sid].push(p);
      }
    });
    return groups;
  }, [filteredProblems, activeSectionId]);

  const visibleSections = useMemo(() => {
    if (activeSectionId) return sections.filter(s => s._id === activeSectionId);
    return sections;
  }, [sections, activeSectionId]);

  const getProblemStatus = useCallback((pid: string): 'solved' | 'unattempted' => {
    if (solvedProblemIds.has(pid)) return 'solved';
    return 'unattempted';
  }, [solvedProblemIds]);

  const toggleSection = useCallback((sid: string) => {
    setCollapsedSections(prev => ({ ...prev, [sid]: !prev[sid] }));
  }, []);

  const difficultyBadge = useCallback((diff: string) => {
    const d = DIFFICULTIES.find(x => x.value === diff.toLowerCase());
    if (!d) return null;
    return (
      <span className={`text-[10px] font-semibold ${d.color} ${d.bg} px-1.5 py-0.5 rounded-md`}>
        {diff}
      </span>
    );
  }, []);

  const statusIcon = useCallback((pid: string) => {
    const s = getProblemStatus(pid);
    if (s === 'solved') return <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    return <FiCircle className="w-3.5 h-3.5 text-light-textMuted/20 dark:text-dark-muted/20 flex-shrink-0" />;
  }, [getProblemStatus]);

  // Progress Ring SVG
  const ringRadius = 28;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercentage / 100) * ringCircumference;

  const SectionGroup: React.FC<{ sectionId: string; problems: Problem[] }> = useCallback(({ sectionId, problems: secProblems }) => {
    const section = sections.find(s => s._id === sectionId);
    const title = section?.title || 'Problems';
    const collapsed = collapsedSections[sectionId];
    const counts = sectionSolvedCounts[sectionId] || { solved: 0, total: secProblems.length };

    return (
      <div className="mb-0.5">
        <button
          onClick={() => { if (!activeSectionId) toggleSection(sectionId); else onSectionChange(''); }}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold tracking-wide text-light-textSecondary dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors group"
        >
          <div className="flex items-center gap-2 min-w-0">
            {activeSectionId ? (
              <FiChevronRight className="w-3 h-3 flex-shrink-0 rotate-180" />
            ) : collapsed ? (
              <FiChevronRight className="w-3 h-3 flex-shrink-0" />
            ) : (
              <FiChevronDown className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{title}</span>
          </div>
          <span className="text-[10px] font-medium flex-shrink-0 ml-2 opacity-60">{counts.solved}/{counts.total}</span>
        </button>
        {!collapsed && (
          <div className="space-y-px">
            {secProblems.map(problem => (
              <button
                key={problem._id}
                onClick={() => onProblemSelect(problem)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-150 group ${
                  activeProblemId === problem._id
                    ? 'bg-brand-primary/10 dark:bg-brand-primary/15 border-l-[3px] border-brand-primary'
                    : 'hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt border-l-[3px] border-transparent'
                }`}
              >
                {statusIcon(problem._id)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs truncate ${
                      activeProblemId === problem._id
                        ? 'text-brand-primary font-semibold'
                        : 'text-light-text dark:text-dark-text font-medium'
                    }`}>
                      {problem.title}
                    </span>
                    {problem.isPremium && <FiStar className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {difficultyBadge(problem.difficulty)}
                    {problem.tags && problem.tags.length > 0 && (
                      <span className="text-[9px] text-light-textMuted dark:text-dark-muted truncate">
                        {problem.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [activeProblemId, activeSectionId, onProblemSelect, onSectionChange, sections, sectionSolvedCounts, collapsedSections, toggleSection, statusIcon, difficultyBadge]);

  const sectionKeys = Object.keys(groupedBySection);

  return (
    <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Header Stats */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-border-subtle dark:border-dark-border">
        <div className="flex items-center gap-4 mb-3">
          {/* Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="64" height="64" className="progress-ring">
              <circle
                cx="32" cy="32" r={ringRadius}
                fill="none"
                stroke="rgba(229,221,210,0.4)"
                strokeWidth="5"
              />
              <circle
                cx="32" cy="32" r={ringRadius}
                fill="none"
                stroke="url(#brandGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                className="progress-ring-circle"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
              <defs>
                <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E06438" />
                  <stop offset="100%" stopColor="#F3A45C" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-bold text-light-text dark:text-dark-text">{solvedCount}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] font-semibold text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Solved</p>
              <p className="text-sm font-bold text-light-text dark:text-dark-text">{solvedCount}/{totalCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Streak</p>
              <p className="text-sm font-bold text-light-text dark:text-dark-text flex items-center justify-center gap-1">
                <FiZap className="w-3 h-3 text-amber-500" />
                {currentStreak}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-light-textMuted dark:text-dark-muted uppercase tracking-wider">Ready</p>
              <p className="text-sm font-bold text-brand-primary">{progressPercentage}%</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-light-textMuted dark:text-dark-muted" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-2.5 py-1.5 text-[12px] bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-lg text-light-text dark:text-dark-text placeholder:text-light-textMuted/50 dark:placeholder:text-dark-muted/50 outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex-shrink-0 px-3 py-1.5 border-b border-border-subtle dark:border-dark-border">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSectionChange('')}
            className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${
              !activeSectionId
                ? 'text-white bg-brand-primary shadow-sm'
                : 'text-light-textSecondary dark:text-dark-muted bg-light-card dark:bg-dark-card hover:text-brand-primary'
            }`}
          >
            All
          </button>
          {sections.slice(0, 5).map(s => (
            <button
              key={s._id}
              onClick={() => onSectionChange(s._id)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap ${
                activeSectionId === s._id
                  ? 'text-white bg-brand-primary shadow-sm'
                  : 'text-light-textSecondary dark:text-dark-muted bg-light-card dark:bg-dark-card hover:text-brand-primary'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty + Bookmarks */}
      <div className="flex-shrink-0 px-3 py-1.5 border-b border-border-subtle dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <FiFilter className="w-3 h-3 text-light-textMuted dark:text-dark-muted flex-shrink-0" />
            {[{ value: null, label: 'All' }, ...DIFFICULTIES].map(d => (
              <button
                key={d.label}
                onClick={() => setSelectedDifficulty(d.value as string | null)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  selectedDifficulty === d.value
                    ? 'bg-light-cardAlt dark:bg-dark-cardAlt text-light-text dark:text-dark-text'
                    : 'text-light-textSecondary dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              showBookmarked ? 'text-amber-500 bg-amber-500/10' : 'text-light-textSecondary dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <FiBookmark className="w-2.5 h-2.5" /> Saved
          </button>
        </div>
      </div>

      {/* Problem List */}
      <div className="flex-1 min-h-0">
        {sectionKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <FiTarget className="w-8 h-8 text-light-textMuted/20 dark:text-dark-muted/20" />
            <div>
              <p className="text-xs font-semibold text-light-textMuted dark:text-dark-muted">No problems match</p>
              <p className="text-[10px] text-light-textMuted/60 dark:text-dark-muted/60 mt-0.5">Try adjusting filters</p>
            </div>
          </div>
        ) : (
          <Virtuoso
            className="scrollbar-thin h-full"
            totalCount={sectionKeys.length}
            itemContent={i => (
              <SectionGroup key={sectionKeys[i]} sectionId={sectionKeys[i]} problems={groupedBySection[sectionKeys[i]]} />
            )}
            components={{ Footer: () => <div className="h-4" /> }}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ProblemListPanel);
