import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCode, FiLock, FiExternalLink, FiShoppingCart, FiHeart, FiCheckCircle, FiSearch, FiBookOpen, FiStar, FiTrendingUp, FiZap, FiChevronRight, FiClock, FiTarget, FiRotateCcw, FiPlay, FiBarChart2, FiAward, FiCalendar, FiCpu, FiChevronDown, FiX, FiBriefcase, FiLayers, FiArrowRight } from 'react-icons/fi';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from '../src/components/ui';
import type { RootState, AppDispatch } from '../src/store';
import { addToCart, getCart } from '../src/store/slices/cartSlice';
import { addToWishlist, getWishlist, removeFromWishlist } from '../src/store/slices/wishlistSlice';
import { fetchDsaCourseData, fetchDsaProgress, Problem } from '../src/store/slices/dsaSlice';
import { setSearchQuery, setDifficultyFilter, toggleFavorite } from '../src/store/slices/workspaceSlice';
import toast from 'react-hot-toast';
import { ErrorState, EmptyState } from '../src/components/common/StateIndicators';
import { CompanyChip } from '../src/components/dsa';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
const STATUS_OPTIONS = ['All', 'Solved', 'Unsolved', 'Bookmarked'] as const;

const ESTIMATED_TIMES: Record<string, number> = { Easy: 15, Medium: 30, Hard: 45 };

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Easy: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  Medium: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  Hard: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
};

const getCompanyTags = (index: number, companies: string[]): string[] => {
  if (companies.length === 0) return [];
  const count = (index % 3) + 1;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(companies[(index + i) % companies.length]);
  }
  return result;
};

const DSAPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
    <div className="border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card/50">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="animate-pulse space-y-3">
          <div className="h-2.5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-48" />
          <div className="h-5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-72" />
          <div className="flex gap-4">
            <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-32" />
            <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-32" />
            <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-32" />
          </div>
          <div className="flex gap-3 mt-2">
            <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-28" />
            <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-28" />
            <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-28" />
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-[1400px] mx-auto px-6 py-6 flex gap-6 animate-pulse">
      <div className="w-64 flex-shrink-0 space-y-4">
        <div className="bg-light-card dark:bg-dark-card rounded-2xl p-4 space-y-3 border border-border-subtle dark:border-dark-border">
          <div className="h-2 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-16" />
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-full bg-light-cardAlt dark:bg-dark-cardAlt" />
            <div className="flex-1 space-y-2">
              <div className="h-2 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-12" />
              <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt" />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-8" />
                  <div className="h-2.5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-light-card dark:bg-dark-card rounded-2xl p-3 border border-border-subtle dark:border-dark-border space-y-2">
            <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-3/4" />
            <div className="h-1.5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-full" />
          </div>
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <div className="bg-light-card dark:bg-dark-card rounded-2xl p-4 border border-border-subtle dark:border-dark-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-light-cardAlt dark:bg-dark-cardAlt" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/3" />
            <div className="h-2 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/2" />
          </div>
          <div className="h-8 w-24 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt" />
        </div>
        <div className="h-9 bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl w-full" />
        <div className="bg-light-card dark:bg-dark-card rounded-2xl border border-border-subtle dark:border-dark-border divide-y divide-border-subtle dark:divide-dark-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="h-5 w-5 rounded-full bg-light-cardAlt dark:bg-dark-cardAlt" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/2" />
                <div className="h-2 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/3" />
              </div>
              <div className="h-6 w-14 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const DSAProblemsPage: React.FC<{ courseId: string }> = ({ courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { course, sections, problems, isEnrolled, status, error, progress, progressStatus } = useSelector((state: RootState) => state.dsa);
  const { favoriteProblems, searchQuery, difficultyFilter } = useSelector((state: RootState) => state.workspace);
  const dsaWorkspaceConfig = useSelector((state: RootState) => state.dsaWorkspace);
  const gamification = useSelector((state: RootState) => state.gamification);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const problemsRef = useRef<HTMLDivElement>(null);

  const isInWishlist = useMemo(() => wishlistItems.some((item: any) => item._id === courseId), [wishlistItems, courseId]);

  useEffect(() => {
    if (courseId) dispatch(fetchDsaCourseData(courseId));
    if (user) dispatch(getWishlist());
  }, [dispatch, courseId, user]);

  useEffect(() => {
    if (courseId && user) dispatch(fetchDsaProgress(courseId));
  }, [dispatch, courseId, user]);

  useEffect(() => {
    if (status === 'succeeded' && sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0]._id);
    }
  }, [status, sections, activeSectionId]);

  const handleWishlistToggle = async () => {
    if (!user) { toast.error('Please login to manage your wishlist'); window.location.hash = '/auth'; return; }
    const action = isInWishlist
      ? dispatch(removeFromWishlist(courseId)).unwrap()
      : dispatch(addToWishlist(courseId)).unwrap();
    const promise = action.then(() => {
      dispatch(getWishlist());
      return isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!';
    });
    toast.promise(promise, {
      loading: 'Updating wishlist...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to update wishlist',
    });
  };

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add to cart'); window.location.hash = '/auth'; return; }
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Session expired. Please login again.'); window.location.hash = '/auth'; return; }
    const promise = dispatch(addToCart(courseId)).unwrap();
    toast.promise(promise, {
      loading: 'Adding to cart...',
      success: () => { dispatch(getCart()); return 'DSA Course added to cart!'; },
      error: (err) => {
        if (err === 'Not authorized, token failed' || err === 'Not authorized, no token') {
          localStorage.removeItem('token'); localStorage.removeItem('user');
          setTimeout(() => { window.location.hash = '/auth'; }, 1500);
          return 'Session expired. Redirecting to login...';
        }
        return err || 'Failed to add to cart';
      },
    });
  };

  const handleProblemClick = (problem: Problem) => {
    if (!problem.isFree && !isEnrolled) {
      toast.error('This problem is locked. Purchase the course to unlock all problems!');
      return;
    }
    window.location.hash = `/dsa/problem/${problem._id}`;
  };

  const problemsArray = useMemo(() => Array.isArray(problems) ? problems : [], [problems]);
  const solvedProblemSet = useMemo(() => new Set(progress?.solvedProblemIds || []), [progress?.solvedProblemIds]);
  const favoriteSet = useMemo(() => new Set(favoriteProblems), [favoriteProblems]);
  const solvedProblems = progress?.solvedProblems ?? 0;
  const totalProblems = progress?.totalProblems ?? problemsArray.length;
  const progressPercentage = totalProblems ? (progress?.percentage ?? Math.round((solvedProblems / totalProblems) * 100)) : 0;
  const isProgressLoading = progressStatus === 'loading';

  const filteredProblems = useMemo(() => {
    const companies = dsaWorkspaceConfig.companies;
    return problemsArray
      .filter(p => p.section === activeSectionId)
      .filter(p => !difficultyFilter || p.difficulty === difficultyFilter)
      .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => {
        if (statusFilter === 'Solved') return solvedProblemSet.has(p._id);
        if (statusFilter === 'Unsolved') return !solvedProblemSet.has(p._id);
        if (statusFilter === 'Bookmarked') return favoriteSet.has(p._id);
        return true;
      })
      .filter(p => !topicFilter || (p as any).tags?.includes(topicFilter))
      .filter(p => {
        if (!companyFilter) return true;
        const tags = (p as any).tags as string[] | undefined;
        if (tags?.some(t => t.toLowerCase().includes(companyFilter.toLowerCase()))) return true;
        const probCompanies = (p as any).companies as string[] | undefined;
        if (probCompanies?.some(c => c.toLowerCase() === companyFilter.toLowerCase())) return true;
        const pIndex = problemsArray.indexOf(p);
        return getCompanyTags(pIndex, companies).includes(companyFilter);
      })
      .sort((a, b) => a.order - b.order);
  }, [problemsArray, activeSectionId, difficultyFilter, searchQuery, statusFilter, topicFilter, companyFilter, favoriteSet, solvedProblemSet, dsaWorkspaceConfig.companies]);

  const activeSection = useMemo(() =>
    sections.find(s => s._id === activeSectionId),
    [sections, activeSectionId]
  );

  const sectionSolvedCounts = useMemo(() => {
    const counts: Record<string, { solved: number; total: number }> = {};
    sections.forEach(s => {
      const sectionProblems = problemsArray.filter(p => p.section === s._id);
      const solved = sectionProblems.filter(p => solvedProblemSet.has(p._id)).length;
      counts[s._id] = { solved, total: sectionProblems.length };
    });
    return counts;
  }, [sections, problemsArray, solvedProblemSet]);

  const recentlySolved = useMemo(() => {
    return problemsArray
      .filter(p => solvedProblemSet.has(p._id))
      .slice(0, 3);
  }, [problemsArray, solvedProblemSet]);

  const sectionTitles = useMemo(() => {
    const titles: Record<string, string> = {};
    sections.forEach(s => { titles[s._id] = s.title; });
    return titles;
  }, [sections]);

  const handleToggleFavorite = useCallback((problemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { toast.error('Please login'); return; }
    dispatch(toggleFavorite(problemId));
  }, [dispatch, user]);

  const handlePracticeRandom = useCallback(() => {
    const unsolved = problemsArray.filter(p => !solvedProblemSet.has(p._id) && (p.isFree || isEnrolled));
    if (unsolved.length === 0) { toast.success('All problems solved!'); return; }
    const random = unsolved[Math.floor(Math.random() * unsolved.length)];
    window.location.hash = `/dsa/problem/${random._id}`;
  }, [problemsArray, solvedProblemSet, isEnrolled]);

  const handleResumeLast = useCallback(() => {
    if (recentlySolved.length > 0) {
      window.location.hash = `/dsa/problem/${recentlySolved[0]._id}`;
    } else {
      const firstUnsolved = problemsArray.find(p => !solvedProblemSet.has(p._id) && (p.isFree || isEnrolled));
      if (firstUnsolved) window.location.hash = `/dsa/problem/${firstUnsolved._id}`;
      else toast('No problems to resume');
    }
  }, [recentlySolved, problemsArray, solvedProblemSet, isEnrolled]);

  const handleContinueLearning = useCallback(() => {
    const nextUnsolved = problemsArray.find(p => !solvedProblemSet.has(p._id) && (p.isFree || isEnrolled));
    if (nextUnsolved) window.location.hash = `/dsa/problem/${nextUnsolved._id}`;
    else if (problemsArray.length > 0) window.location.hash = `/dsa/problem/${problemsArray[0]._id}`;
  }, [problemsArray, solvedProblemSet, isEnrolled]);

  const acceptanceRate = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const xpTotal = gamification?.xp?.totalXP ?? 0;
  const xpLevel = gamification?.xp?.level ?? 1;
  const currentStreak = gamification?.streak?.currentStreak ?? 0;
  const totalEstHours = Math.round(problemsArray.reduce((sum, p) => sum + (ESTIMATED_TIMES[p.difficulty] || 20), 0) / 60);
  const studiedHours = Math.round(solvedProblems * 0.5);
  const rank = xpLevel > 1 ? `Lv.${xpLevel}` : 'Beginner';
  const careerReadiness = Math.min(100, Math.round((solvedProblems / Math.max(totalProblems, 1)) * 60 + (currentStreak / 30) * 20 + Math.min(xpLevel / 10, 1) * 20));

  const sectionPercent = (solved: number, total: number) => total > 0 ? Math.round((solved / total) * 100) : 0;

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    problemsArray.filter(p => p.section === activeSectionId).forEach(p => {
      const pt = (p as any).tags;
      if (Array.isArray(pt)) pt.forEach((t: string) => tags.add(t));
    });
    return Array.from(tags).sort();
  }, [problemsArray, activeSectionId]);

  const difficultyCounts = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    problemsArray.forEach(p => {
      if (p.difficulty in counts) counts[p.difficulty as keyof typeof counts]++;
    });
    return counts;
  }, [problemsArray]);

  const recommendedNext = useMemo(() => {
    const unsolved = problemsArray.filter(p => !solvedProblemSet.has(p._id) && (p.isFree || isEnrolled));
    return unsolved.length > 0 ? unsolved[0] : null;
  }, [problemsArray, solvedProblemSet, isEnrolled]);

  const renderContent = () => {
    if (status === 'loading' || status === 'idle') return <DSAPageSkeleton />;
    if (status === 'failed') return <ErrorState message={error || "Couldn't load the DSA course."} onRetry={() => dispatch(fetchDsaCourseData(courseId))} />;
    if (status === 'succeeded' && (!course || sections.length === 0)) {
      return <EmptyState title="Course Not Found" message="We couldn't find the details for this DSA course." />;
    }

    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
        {/* Hero Section */}
        <div className="flex-shrink-0 border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card/50">
          <div className="max-w-[1400px] mx-auto px-6 py-4">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase tracking-[0.25em] text-brand-primary font-semibold mb-1">
                  {dsaWorkspaceConfig.title}
                </p>
                <h1 className="text-xl font-bold text-light-text dark:text-dark-text">
                  {course?.title || 'DSA Mastery Course'}
                </h1>
                <p className="text-[11px] text-light-textSecondary dark:text-dark-muted mt-1 max-w-xl leading-relaxed">
                  {dsaWorkspaceConfig.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-light-textSecondary dark:text-dark-muted">
                    <FiCode className="w-3 h-3" />
                    <span className="font-medium text-light-text dark:text-dark-text">{problemsArray.length}</span> problems
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-light-textSecondary dark:text-dark-muted">
                    <FiClock className="w-3 h-3" />
                    <span className="font-medium text-light-text dark:text-dark-text">~{totalEstHours}h</span> est. time
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    {(['Easy', 'Medium', 'Hard'] as const).map(d => (
                      <span key={d} className={`flex items-center gap-1 ${DIFFICULTY_COLORS[d].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_COLORS[d].dot}`} />
                        {difficultyCounts[d]} {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[9px] text-light-textMuted dark:text-dark-muted uppercase tracking-wider font-semibold">Asked by</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dsaWorkspaceConfig.companies.slice(0, 4).map(c => (
                      <CompanyChip key={c} name={c} size={12} />
                    ))}
                    {dsaWorkspaceConfig.companies.length > 4 && (
                      <span className="text-[9px] text-light-textMuted dark:text-dark-muted ml-0.5">+{dsaWorkspaceConfig.companies.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {isEnrolled ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleContinueLearning}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover shadow-sm shadow-brand-primary/20 hover:shadow-md hover:shadow-brand-primary/25 transition-all active:scale-[0.97]"
                    >
                      <FiPlay className="w-3.5 h-3.5 fill-current" />
                      Continue Learning
                    </button>
                    <button
                      onClick={handlePracticeRandom}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-brand-primary bg-brand-primary/8 hover:bg-brand-primary/15 border border-brand-primary/20 hover:border-brand-primary/30 transition-all active:scale-[0.97]"
                    >
                      <FiRotateCcw className="w-3 h-3" />
                      Random
                    </button>
                    <button
                      onClick={handleResumeLast}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-light-textSecondary dark:text-dark-muted border border-border-subtle dark:border-dark-border hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt hover:text-light-text dark:hover:text-dark-text transition-all active:scale-[0.97]"
                    >
                      <FiClock className="w-3 h-3" />
                      Resume
                    </button>
                  </div>
                ) : course ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleWishlistToggle} className="!px-3 !py-2 !text-[11px] rounded-xl">
                      <FiHeart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
                      <span className="hidden sm:inline ml-1">{isInWishlist ? 'Saved' : 'Wishlist'}</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleAddToCart} className="!px-4 !py-2 !text-[11px] rounded-xl shadow-sm shadow-brand-primary/20">
                      <FiShoppingCart className="w-3.5 h-3.5" />
                      <span className="ml-1">&8377;{course.price}</span>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-64 lg:w-72 flex-shrink-0 border-r border-border-subtle dark:border-dark-border bg-light-card/30 dark:bg-dark-card/20 overflow-y-auto scrollbar-thin">
            <div className="p-4 space-y-4">
              {/* Overview Card */}
              <div className="workspace-card p-4 hover:shadow-md hover:border-brand-primary/10 transition-all duration-300">
                <p className="workspace-label mb-3 flex items-center gap-1.5">
                  <FiBarChart2 className="w-3 h-3" />
                  Overview
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 flex-shrink-0">
                    <CircularProgressbar
                      value={progressPercentage}
                      text={`${progressPercentage}%`}
                      styles={buildStyles({
                        textSize: '24px',
                        pathColor: '#E06438',
                        trailColor: '#E5DDD2',
                        textColor: 'currentColor',
                        pathTransitionDuration: 0.8,
                      })}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Progress</p>
                    <p className="text-lg font-bold text-light-text dark:text-dark-text leading-none">
                      {isProgressLoading ? '-' : `${solvedProblems}`}
                      <span className="text-xs font-medium text-light-textMuted dark:text-dark-muted">/{totalProblems}</span>
                    </p>
                    <p className="text-[9px] text-light-textSecondary dark:text-dark-muted">problems solved</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 pt-3 border-t border-border-subtle dark:border-dark-border">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                      <FiZap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">XP</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{xpTotal.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Streak</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text">{currentStreak}d</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiAward className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Rank</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <FiTarget className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Rate</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text">{acceptanceRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Studied</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{studiedHours}h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center flex-shrink-0">
                      <FiTrendingUp className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase tracking-wider text-light-textMuted dark:text-dark-muted font-semibold">Ready</p>
                      <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{careerReadiness}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Next Problem */}
              {recommendedNext && isEnrolled && (
                <div className="workspace-card overflow-hidden group hover:shadow-md hover:border-brand-primary/20 transition-all duration-300">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-primary/15 flex items-center justify-center">
                        <FiTarget className="w-3.5 h-3.5 text-brand-primary" />
                      </div>
                      <p className="text-[10px] font-bold text-light-text dark:text-dark-text uppercase tracking-wider">Next Up</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
                      <div className="w-1 h-8 rounded-full bg-brand-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-light-text dark:text-dark-text truncate">{recommendedNext.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-medium ${DIFFICULTY_COLORS[recommendedNext.difficulty].text}`}>
                            {recommendedNext.difficulty}
                          </span>
                          <span className="text-[9px] text-light-textMuted dark:text-dark-muted">
                            ~{ESTIMATED_TIMES[recommendedNext.difficulty]}m
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleProblemClick(recommendedNext)}
                        className="w-7 h-7 rounded-lg bg-brand-primary flex items-center justify-center text-white hover:bg-brand-primaryHover transition-all active:scale-90 flex-shrink-0"
                      >
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="workspace-card hover:shadow-sm transition-all duration-300">
                <div className="px-4 py-3 border-b border-border-subtle dark:border-dark-border">
                  <p className="workspace-label flex items-center gap-1.5">
                    <FiLayers className="w-3 h-3" />
                    Sections
                  </p>
                </div>
                <div className="p-2 space-y-0.5 max-h-[320px] overflow-y-auto scrollbar-thin">
                  {sections.map((section) => {
                    const counts = sectionSolvedCounts[section._id] || { solved: 0, total: 0 };
                    const pct = sectionPercent(counts.solved, counts.total);
                    const isComplete = counts.total > 0 && counts.solved === counts.total;
                    const isActive = activeSectionId === section._id;
                    const sectionEstTime = counts.total * 25;
                    return (
                      <button
                        key={section._id}
                        onClick={() => setActiveSectionId(section._id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? 'bg-brand-primary/10 dark:bg-brand-primary/15 ring-1 ring-brand-primary/30'
                            : 'hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${
                            isComplete ? 'bg-emerald-500' : isActive ? 'bg-brand-primary' : 'bg-border-subtle dark:bg-dark-border'
                          }`} />
                          <span className={`flex-1 text-xs font-semibold truncate transition-colors ${
                            isActive ? 'text-brand-primary' : 'text-light-text dark:text-dark-text'
                          }`}>
                            {section.title}
                          </span>
                          <span className={`text-[9px] font-semibold flex-shrink-0 ${
                            isComplete ? 'text-emerald-500' : isActive ? 'text-brand-primary' : 'text-light-textMuted dark:text-dark-muted'
                          }`}>
                            {counts.solved}/{counts.total}
                          </span>
                          {isComplete && (
                            <FiCheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="relative h-1 rounded-full bg-light-cardAlt dark:bg-dark-cardAlt overflow-hidden mb-1">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
                              isComplete ? 'bg-emerald-500' : 'bg-brand-primary'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between px-0.5">
                          <span className="text-[8px] text-light-textMuted dark:text-dark-muted font-medium">{pct}%</span>
                          <span className="text-[8px] text-light-textMuted dark:text-dark-muted">~{sectionEstTime}min</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Mentor Card */}
              <div className="workspace-card bg-gradient-to-br from-brand-primary/[0.04] to-brand-accent/[0.04] dark:from-brand-primary/[0.08] dark:to-transparent border-brand-primary/10 dark:border-brand-primary/20 hover:shadow-md hover:border-brand-primary/20 transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-primary/15 flex items-center justify-center">
                      <FiCpu className="w-3.5 h-3.5 text-brand-primary" />
                    </div>
                    <p className="text-xs font-bold text-light-text dark:text-dark-text">AI Mentor</p>
                  </div>
                  <div className="space-y-1.5">
                    <button
                      onClick={handleContinueLearning}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold text-light-text dark:text-dark-text bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border-subtle dark:border-dark-border hover:border-brand-primary/30 transition-all group"
                    >
                      <FiPlay className="w-3.5 h-3.5 text-brand-primary" />
                      <span className="flex-1 text-left">Continue Study Plan</span>
                      <FiArrowRight className="w-3 h-3 text-light-textMuted dark:text-dark-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <button
                      onClick={handlePracticeRandom}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold text-light-text dark:text-dark-text bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border-subtle dark:border-dark-border hover:border-brand-accent/30 transition-all group"
                    >
                      <FiTarget className="w-3.5 h-3.5 text-brand-accent" />
                      <span className="flex-1 text-left">Recommend Next Topic</span>
                      <FiArrowRight className="w-3 h-3 text-light-textMuted dark:text-dark-muted group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-semibold text-light-text dark:text-dark-text bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-border-subtle dark:border-dark-border hover:border-amber-400/30 transition-all group">
                      <FiBarChart2 className="w-3.5 h-3.5 text-amber-500" />
                      <span className="flex-1 text-left">Weak Areas</span>
                      <FiArrowRight className="w-3 h-3 text-light-textMuted dark:text-dark-muted group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recently Solved */}
              {recentlySolved.length > 0 && (
                <div className="workspace-card p-4 hover:shadow-sm transition-all duration-300">
                  <p className="workspace-label flex items-center gap-1.5 mb-2">
                    <FiClock className="w-3 h-3" />
                    Recent
                  </p>
                  <div className="space-y-1">
                    {recentlySolved.map(p => (
                      <button
                        key={p._id}
                        onClick={() => handleProblemClick(p)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-light-textSecondary dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt hover:text-light-text dark:hover:text-dark-text transition-colors truncate flex items-center gap-2"
                      >
                        <FiCheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{p.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main ref={problemsRef} className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-[1000px] mx-auto p-6">
              {/* Non-enrolled banner */}
              {!isEnrolled && course && (
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-brand-primary/[0.04] via-brand-accent/[0.04] to-transparent border border-brand-primary/15 flex items-center justify-between gap-4 group hover:border-brand-primary/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiLock className="w-4 h-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-light-text dark:text-dark-text">Unlock All Problems</p>
                      <p className="text-[11px] text-light-textSecondary dark:text-dark-muted mt-0.5">
                        Get access to all {problemsArray.length} problems with starter code, test cases, and solutions.
                      </p>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddToCart} className="!px-4 !py-2.5 !text-[11px] rounded-xl flex-shrink-0 shadow-sm shadow-brand-primary/20">
                    <FiShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    &8377;{course.price}
                  </Button>
                </div>
              )}

              {/* Continue Learning Widget */}
              {recommendedNext && isEnrolled && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-brand-primary/[0.03] to-brand-accent/[0.03] border border-brand-primary/10 hover:border-brand-primary/25 transition-all duration-300 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <FiPlay className="w-4 h-4 text-brand-primary fill-current ml-0.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-light-text dark:text-dark-text">Continue Learning</p>
                        <p className="text-[10px] text-light-textSecondary dark:text-dark-muted mt-0.5">
                          Next up: <span className="font-medium text-light-text dark:text-dark-text">{recommendedNext.title}</span> &mdash; {recommendedNext.difficulty} &middot; ~{ESTIMATED_TIMES[recommendedNext.difficulty]}m
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleProblemClick(recommendedNext)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-semibold text-white bg-brand-primary hover:bg-brand-primaryHover shadow-sm shadow-brand-primary/20 hover:shadow-md transition-all active:scale-[0.97] flex-shrink-0"
                    >
                      Solve Now
                      <FiArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-light-textMuted dark:text-dark-muted pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search problems..."
                    value={searchQuery}
                    onChange={e => dispatch(setSearchQuery(e.target.value))}
                    className="w-full pl-8 pr-7 py-1.5 text-[11px] bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-lg text-light-text dark:text-dark-text placeholder-light-textMuted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => dispatch(setSearchQuery(''))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Difficulty */}
                <div className="flex gap-1">
                  {DIFFICULTIES.map(d => {
                    const colors = DIFFICULTY_COLORS[d];
                    const isActive = difficultyFilter === d;
                    return (
                      <button
                        key={d}
                        onClick={() => dispatch(setDifficultyFilter(difficultyFilter === d ? null : d))}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                          isActive
                            ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm`
                            : 'border-transparent text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt hover:text-light-text dark:hover:text-dark-text'
                        }`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? colors.dot : 'bg-current'} mr-1 align-middle`} />
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* Status */}
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                        statusFilter === s
                          ? 'bg-light-cardAlt dark:bg-dark-cardAlt border-border-subtle dark:border-dark-border text-light-text dark:text-dark-text shadow-sm'
                          : 'border-transparent text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Companies Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowCompanies(!showCompanies)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                      companyFilter
                        ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                        : 'border-transparent text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                    }`}
                  >
                    <FiBriefcase className="w-3 h-3" />
                    {companyFilter || 'Company'}
                    <FiChevronDown className={`w-3 h-3 transition-transform ${showCompanies ? 'rotate-180' : ''}`} />
                  </button>
                  {showCompanies && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCompanies(false)} />
                      <div className="absolute top-full left-0 mt-1 z-20 w-44 bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto scrollbar-thin">
                        <button
                          onClick={() => { setCompanyFilter(null); setShowCompanies(false); }}
                          className="w-full text-left px-3 py-1.5 text-[11px] text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt"
                        >
                          All Companies
                        </button>
                        {dsaWorkspaceConfig.companies.map(c => (
                          <button
                            key={c}
                            onClick={() => { setCompanyFilter(c); setShowCompanies(false); }}
                            className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                              companyFilter === c
                                ? 'text-brand-primary bg-brand-primary/5 font-semibold'
                                : 'text-light-text dark:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Topics */}
                {allTags.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowTopics(!showTopics)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                        topicFilter
                          ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                          : 'border-transparent text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                      }`}
                    >
                      <FiCode className="w-3 h-3" />
                      {topicFilter || 'Topic'}
                      <FiChevronDown className={`w-3 h-3 transition-transform ${showTopics ? 'rotate-180' : ''}`} />
                    </button>
                    {showTopics && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowTopics(false)} />
                        <div className="absolute top-full left-0 mt-1 z-20 w-48 bg-light-card dark:bg-dark-card border border-border-subtle dark:border-dark-border rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto scrollbar-thin">
                          <button
                            onClick={() => { setTopicFilter(null); setShowTopics(false); }}
                            className="w-full text-left px-3 py-1.5 text-[11px] text-light-textMuted dark:text-dark-muted hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt"
                          >
                            All Topics
                          </button>
                          {allTags.map(tag => (
                            <button
                              key={tag}
                              onClick={() => { setTopicFilter(tag); setShowTopics(false); }}
                              className={`w-full text-left px-3 py-1.5 text-[11px] transition-colors ${
                                topicFilter === tag
                                  ? 'text-brand-primary bg-brand-primary/5 font-semibold'
                                  : 'text-light-text dark:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Clear */}
                {(searchQuery || difficultyFilter || statusFilter !== 'All' || topicFilter || companyFilter) && (
                  <button
                    onClick={() => { dispatch(setSearchQuery('')); dispatch(setDifficultyFilter(null)); setStatusFilter('All'); setTopicFilter(null); setCompanyFilter(null); }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-bold text-light-text dark:text-dark-text">
                    {activeSection?.title || 'Select a Section'}
                  </h2>
                  {activeSection && (
                    <p className="text-[10px] text-light-textSecondary dark:text-dark-muted mt-0.5">
                      {sectionSolvedCounts[activeSectionId!]?.solved || 0}/{filteredProblems.length} solved &middot; ~{filteredProblems.length * 20}min estimated
                    </p>
                  )}
                </div>
              </div>

              {/* Problem List */}
              {filteredProblems.length > 0 ? (
                <div className="workspace-card overflow-hidden">
                  <div className="divide-y divide-border-subtle dark:divide-dark-border">
                    {filteredProblems.map((problem, index) => {
                      const isSolved = solvedProblemSet.has(problem._id);
                      const isFavorite = favoriteSet.has(problem._id);
                      const isLocked = !problem.isFree && !isEnrolled;
                      const colors = DIFFICULTY_COLORS[problem.difficulty] || DIFFICULTY_COLORS.Easy;
                      const estTime = ESTIMATED_TIMES[problem.difficulty] || 20;
                      const probTags = (problem as any).tags as string[] | undefined;
                      const companyTags = getCompanyTags(index, dsaWorkspaceConfig.companies);
                      return (
                        <div
                          key={problem._id}
                          onClick={() => handleProblemClick(problem)}
                          className="px-4 py-3 flex items-center gap-3 hover:bg-light-cardAlt/60 dark:hover:bg-dark-cardAlt/40 transition-all duration-150 cursor-pointer group"
                        >
                          {/* Status */}
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            {isSolved ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              </div>
                            ) : isLocked ? (
                              <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-dark-cardAlt flex items-center justify-center">
                                <FiLock className="w-2.5 h-2.5 text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-border-subtle dark:border-dark-border group-hover:border-brand-primary/60 transition-all" />
                            )}
                          </div>

                          {/* Number */}
                          <span className="text-[10px] font-mono text-light-textMuted dark:text-dark-muted w-5 flex-shrink-0 text-right">
                            {index + 1}
                          </span>

                          {/* Title + Tags */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-[12px] font-semibold truncate ${
                                isSolved ? 'text-emerald-600 dark:text-emerald-400' : 'text-light-text dark:text-dark-text'
                              }`}>
                                {problem.title}
                              </span>
                              {probTags && probTags.length > 0 && (
                                <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
                                  {probTags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-light-cardAlt dark:bg-dark-cardAlt text-light-textMuted dark:text-dark-muted whitespace-nowrap">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="hidden sm:flex items-center gap-1 mt-0.5">
                              {companyTags.slice(0, 2).map(c => (
                                <CompanyChip key={c} name={c} size={10} showName={true} />
                              ))}
                              <span className="text-[8px] text-light-textMuted/40 dark:text-dark-muted/30 ml-1">{isSolved ? 'Solved' : 'Unsolved'}</span>
                            </div>
                          </div>

                          {/* Estimated Time */}
                          <div className="hidden md:flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-muted flex-shrink-0">
                            <FiClock className="w-2.5 h-2.5" />
                            <span>{estTime}m</span>
                          </div>

                          {/* Difficulty */}
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${colors.bg} ${colors.text} flex-shrink-0`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {problem.difficulty}
                          </div>

                          {/* Bookmark */}
                          <button
                            onClick={(e) => handleToggleFavorite(problem._id, e)}
                            className={`p-1 rounded-md transition-all flex-shrink-0 ${
                              isFavorite
                                ? 'text-amber-500 opacity-100'
                                : 'text-light-textMuted/40 dark:text-dark-muted/40 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                            }`}
                          >
                            <FiStar className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>

                          {/* LeetCode Link */}
                          {problem.leetcodeLink && (
                            <a
                              href={problem.leetcodeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1 rounded-md text-light-textMuted/40 dark:text-dark-muted/40 hover:text-brand-primary transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <FiExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="workspace-card p-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-light-cardAlt dark:bg-dark-cardAlt flex items-center justify-center mx-auto mb-4">
                    <FiSearch className="w-6 h-6 text-light-textMuted/40 dark:text-dark-muted/40" />
                  </div>
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text">No problems match your filters</p>
                  <p className="text-[11px] text-light-textSecondary dark:text-dark-muted mt-1">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => { dispatch(setSearchQuery('')); dispatch(setDifficultyFilter(null)); setStatusFilter('All'); setTopicFilter(null); setCompanyFilter(null); }}
                    className="mt-3 px-4 py-2 rounded-xl text-[11px] font-semibold text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/15 transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Bottom Stats */}
              {filteredProblems.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-[10px] text-light-textMuted dark:text-dark-muted">
                  <span>Showing {filteredProblems.length} of {problemsArray.filter(p => p.section === activeSectionId).length} problems</span>
                  <span>{sectionSolvedCounts[activeSectionId!]?.solved || 0} solved</span>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  };

  return <>{renderContent()}</>;
};

export default DSAProblemsPage;
