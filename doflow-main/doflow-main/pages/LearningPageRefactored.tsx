import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { recordLessonCompletion } from '../src/store/slices/gamificationSlice';
import api from '../src/utils/api';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCheck,
  FaPlay, FaBook, FaCode, FaQuestionCircle, FaLaptopCode, FaLightbulb,
  FaClipboardList, FaBars, FaTimes, FaLock, FaCrown, FaMoon, FaSun,
  FaKeyboard, FaTrophy, FaClock, FaSearch, FaFire, FaStar, FaRocket,
  FaGraduationCap, FaArrowRight, FaCheckDouble
} from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { executeCode } from '../services/codeExecutionService';
import AITutor from '../src/components/AITutor';
import PremiumContentLock from '../src/components/PremiumContentLock';
import MilestoneBadge from '../src/components/MilestoneBadge';
import RichTextRenderer from '../src/components/learning/RichTextRenderer';
import LearningSidebar from '../src/components/learning/LearningSidebar';
import AIFloatingPanel from '../src/components/learning/AIFloatingPanel';
import {
  SidebarSkeleton,
  LessonContentSkeleton,
  useMinimumLoadingTime
} from '../src/components/Skeleton';
import {
  fadeIn, slideUp, slideDown, slideInLeft, scaleIn, popIn, staggerContainer
} from '../src/styles/motion';

interface LearningPageProps {
  courseId: string;
}

interface LessonContent {
  type: string;
  content: any;
  hideSidebar?: boolean;
}

const LearningPage: React.FC<LearningPageProps> = ({ courseId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(-1);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(-1);
  const [progress, setProgress] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);

  const showSkeleton = useMinimumLoadingTime(isLoading, 500);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqCorrect, setMcqCorrect] = useState<boolean | null>(null);

  const [testAnswers, setTestAnswers] = useState<{ [key: number]: number }>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  const [code, setCode] = useState('# Write your Python code here\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const [copiedCode, setCopiedCode] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [milestone, setMilestone] = useState<{ type: 'lesson-complete' | 'module-complete' | 'course-complete' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const analyticsSessionId = React.useMemo(() => {
    const key = 'doflow_session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, newId);
    return newId;
  }, []);

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setSessionSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatSessionTime = useCallback((totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (isSidebarOpen) { setIsSidebarOpen(false); return; }
        if (isFocusMode) { setIsFocusMode(false); return; }
        return;
      }

      if (e.key === 'ArrowLeft' && (e.altKey || e.metaKey)) {
        e.preventDefault();
        navigateLesson('prev');
        return;
      }
      if (e.key === 'ArrowRight' && (e.altKey || e.metaKey)) {
        e.preventDefault();
        navigateLesson('next');
        return;
      }

      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
        toast.success(isFocusMode ? 'Focus mode off' : 'Focus mode on \u2014 distractions hidden');
        return;
      }

      if (e.key === 's' && !e.ctrlKey && !e.metaKey && window.innerWidth >= 1024) {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isFocusMode, showShortcuts, currentModuleIndex, currentLessonIndex, course]);

  const programmingLanguage = React.useMemo(() => {
    const tags = course?.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase() === 'java')) return 'Java';
    if (tags.some((tag: string) => tag.toLowerCase() === 'python')) return 'Python';
    if (tags.some((tag: string) => tag.toLowerCase() === 'javascript')) return 'JavaScript';
    if (tags.some((tag: string) => tag.toLowerCase() === 'c++')) return 'C++';
    return 'Python';
  }, [course?.tags]);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async (keepLesson = false) => {
    try {
      const [courseRes, progressRes, purchasesRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`).catch(() => ({ data: {} })),
        api.get('/users/purchases').catch(() => ({ data: { purchases: [] } }))
      ]);

      if (!keepLesson) setCourse(courseRes.data);

      const progressData = progressRes.data || {};
      const completedLessonIds = (progressData.enrollment?.completedLessons || [])
        .map((cl: any) => cl.lessonId?.toString?.() || cl.lessonId);
      setProgress({ ...progressData, completedLessons: completedLessonIds });
      setUserPurchases(purchasesRes.data.purchases || []);

      if (!keepLesson) {
        setCurrentLesson(null);
        setCurrentModuleIndex(-1);
        setCurrentLessonIndex(-1);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      toast.error('Failed to load course');
      setIsLoading(false);
    }
  };

  const getLessonContent = (lesson: any): LessonContent | null => {
    if (!lesson?.resources?.[0]?.url) return null;
    try {
      return JSON.parse(lesson.resources[0].url);
    } catch {
      return null;
    }
  };

  const getLessonType = (lesson: any): string => {
    const content = getLessonContent(lesson);
    if (content?.type) return content.type;

    const title = lesson?.title?.toLowerCase() || '';
    if (title.includes('mcq') || title.includes('quiz')) return 'mcq';
    if (title.includes('coding task') || title.includes('challenge')) return 'codingTask';
    if (title.includes('test')) return 'moduleTest';
    if (title.includes('completion')) return 'completion';
    return 'concept';
  };

  const getLessonIcon = (description: string) => {
    const lower = description?.toLowerCase() || '';
    if (lower.includes('quiz') || lower.includes('mcq'))
      return <FaQuestionCircle className="w-4 h-4" />;
    if (lower.includes('code') || lower.includes('challenge'))
      return <FaCode className="w-4 h-4" />;
    if (lower.includes('test'))
      return <FaClipboardList className="w-4 h-4" />;
    return <FaPlay className="w-4 h-4" />;
  };

  const calculateProgress = (): number => {
    if (!course?.sections || !progress?.completedLessons) return 0;
    const totalLessons = course.sections.reduce(
      (acc: number, section: any) => acc + (section.lessons?.length || 0),
      0
    );
    if (totalLessons === 0) return 0;
    const completedCount = progress.completedLessons.length;
    return Math.round((completedCount / totalLessons) * 100);
  };

  const selectLesson = (lesson: any, moduleIdx: number, lessonIdx: number) => {
    setCurrentLesson(lesson);
    setCurrentModuleIndex(moduleIdx);
    setCurrentLessonIndex(lessonIdx);
    setSelectedAnswer(null);
    setMcqSubmitted(false);
    setMcqCorrect(null);
    setIsSidebarOpen(false);
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!course?.sections) return;

    let newModuleIdx = currentModuleIndex;
    let newLessonIdx = currentLessonIndex;

    if (direction === 'next') {
      if (newLessonIdx < course.sections[newModuleIdx].lessons.length - 1) {
        newLessonIdx++;
      } else if (newModuleIdx < course.sections.length - 1) {
        newModuleIdx++;
        newLessonIdx = 0;
      } else {
        toast.error('This is the last lesson');
        return;
      }
    } else {
      if (newLessonIdx > 0) {
        newLessonIdx--;
      } else if (newModuleIdx > 0) {
        newModuleIdx--;
        newLessonIdx = course.sections[newModuleIdx].lessons.length - 1;
      } else {
        toast.error('This is the first lesson');
        return;
      }
    }

    const newLesson = course.sections[newModuleIdx].lessons[newLessonIdx];
    selectLesson(newLesson, newModuleIdx, newLessonIdx);
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;
    try {
      await api.post('/progress', {
        courseId,
        lessonId: currentLesson._id,
        isCompleted: true
      });
      toast.success('Lesson marked complete!');

      const newCompletedCount = (progress?.completedLessons?.length || 0) + 1;
      const totalLessons = course?.sections?.reduce(
        (acc: number, s: any) => acc + (s.lessons?.length || 0), 0
      ) || 1;

      if (newCompletedCount >= totalLessons) {
        setMilestone({ type: 'course-complete' });
      } else {
        const currentModule = course?.sections?.[currentModuleIndex];
        if (currentModule) {
          const moduleLessons = currentModule.lessons || [];
          const moduleCompleted = moduleLessons.every((l: any) =>
            l._id === currentLesson._id || progress?.completedLessons?.includes(l._id)
          );
          if (moduleCompleted) {
            setMilestone({ type: 'module-complete' });
          } else {
            setMilestone({ type: 'lesson-complete' });
          }
        } else {
          setMilestone({ type: 'lesson-complete' });
        }
      }

      await fetchCourseData(true);

      dispatch(recordLessonCompletion({ courseId, lessonTitle: currentLesson.title }));
    } catch (error) {
      toast.error('Failed to mark lesson complete');
    }
  };

  const toggleModule = (idx: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  const getMilestoneBadge = (): { label: string; color: string; icon: React.ReactNode } | null => {
    const pct = calculateProgress();
    if (pct >= 100) return { label: 'Course Complete!', color: 'from-yellow-400 to-orange-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    if (pct >= 75) return { label: 'Almost There!', color: 'from-orange-400 to-red-500 text-white', icon: <FaRocket className="w-4 h-4" /> };
    if (pct >= 50) return { label: 'Halfway Hero', color: 'from-green-400 to-emerald-500 text-white', icon: <FaStar className="w-4 h-4" /> };
    if (pct >= 25) return { label: 'Good Start', color: 'from-blue-400 to-indigo-500 text-white', icon: <FaFire className="w-4 h-4" /> };
    if (pct > 0) return { label: 'First Steps', color: 'from-purple-400 to-pink-500 text-white', icon: <FaGraduationCap className="w-4 h-4" /> };
    return null;
  };

  const hasCoursePurchase = (): boolean => {
    if (!course) return false;
    if (!course.isPremium && course.price === 0) return true;
    return userPurchases.includes(courseId) || userPurchases.includes(course._id);
  };

  const isLessonLocked = (lesson: any): boolean => {
    if (!lesson) return false;
    if (lesson.isPreview) return false;
    if (lesson.isPremiumOnly && !hasCoursePurchase()) return true;
    return false;
  };

  const lessonType = currentLesson ? getLessonType(currentLesson) : null;
  const lessonContent = currentLesson ? getLessonContent(currentLesson) : null;
  const isCurrentLessonLocked = currentLesson ? isLessonLocked(currentLesson) : false;

  useEffect(() => {
    if (isCurrentLessonLocked && courseId) {
      api.post('/analytics/event', {
        eventType: 'premium_lock_view',
        courseId,
        sessionId: analyticsSessionId,
        metadata: {
          lessonId: currentLesson?._id,
          lessonTitle: currentLesson?.title
        }
      }).catch(() => undefined);
    }
  }, [isCurrentLessonLocked, courseId, analyticsSessionId, currentLesson?._id]);

  const handleMCQSubmit = () => {
    if (!selectedAnswer) return;
    const content = lessonContent?.content || {};
    const correctAnswerLetter = typeof content.correctAnswer === 'number'
      ? String.fromCharCode(65 + content.correctAnswer)
      : content.correctAnswer;
    const correct = selectedAnswer === correctAnswerLetter;
    setMcqSubmitted(true);
    setMcqCorrect(correct);
    if (correct) {
      markLessonComplete();
      toast.success('Correct answer!');
    }
  };

  const handleTestSubmit = () => {
    const content = lessonContent?.content || {};
    const questions = content.questions || [];
    let correct = 0;
    questions.forEach((q: any, idx: number) => {
      if (testAnswers[idx] === q.correctAnswer) correct++;
    });
    const scorePercent = Math.round((correct / questions.length) * 100);
    setTestScore(scorePercent);
    setTestSubmitted(true);
    if (scorePercent >= 70) {
      markLessonComplete();
      toast.success(`Test passed with ${scorePercent}%!`);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setOutput('Running your code...\n');

    try {
      const result = await executeCode(code, programmingLanguage.toLowerCase());

      if (result.success) {
        if (result.error) {
          setOutput(`Error:\n${result.error}`);
        } else if (result.output) {
          setOutput(result.output);
        } else {
          setOutput('Code executed successfully (no output).');
        }

        if (result.executionTime) {
          setOutput(prev => prev + `\n\n\u23F1\uFE0F Execution time: ${result.executionTime}ms`);
        }
      } else {
        setOutput(`Execution Failed:\n${result.error || result.message || 'Unknown error occurred'}`);
        toast.error('Code execution failed');
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message || 'Failed to execute code'}`);
      toast.error('Failed to connect to code execution service');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    const content = lessonContent?.content || {};
    const testCases = content.testCases || [];

    if (testCases.length === 0) {
      toast.error('No test cases available for this problem');
      return;
    }

    setIsRunning(true);
    setOutput('Running test cases...\n\n');

    try {
      let passed = 0;
      let failed = 0;
      let results = '';

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const input = testCase.input || '';
        const expectedOutput = (testCase.output || '').trim();

        results += `Test Case ${i + 1}:\n`;
        results += `Input: ${input || '(none)'}\n`;

        try {
          const result = await executeCode(code, programmingLanguage.toLowerCase(), input);

          if (result.success && !result.error) {
            const actualOutput = result.output.trim();

            if (actualOutput === expectedOutput) {
              passed++;
              results += `\u2705 Passed\n`;
              results += `Output: ${actualOutput}\n\n`;
            } else {
              failed++;
              results += `\u274C Failed\n`;
              results += `Expected: ${expectedOutput}\n`;
              results += `Got: ${actualOutput}\n\n`;
            }
          } else {
            failed++;
            results += `\u274C Runtime Error\n`;
            results += `Error: ${result.error || 'Unknown error'}\n\n`;
          }
        } catch (error: any) {
          failed++;
          results += `\u274C Execution Error\n`;
          results += `Error: ${error.message}\n\n`;
        }
      }

      results += `\n${'='.repeat(50)}\n`;
      results += `Results: ${passed}/${testCases.length} test cases passed\n`;

      if (passed === testCases.length) {
        results += `\n\uD83C\uDF89 All test cases passed! Your solution has been accepted.`;
        markLessonComplete();
        toast.success('Congratulations! All test cases passed!');
      } else {
        results += `\n\u26A0\uFE0F Some test cases failed. Keep trying!`;
        toast.error(`${failed} test case(s) failed`);
      }

      setOutput(results);
    } catch (error: any) {
      setOutput(`Submission Error: ${error.message || 'Failed to submit code'}`);
      toast.error('Failed to submit code');
    } finally {
      setIsRunning(false);
    }
  };

  // ── RENDER: CONCEPT LESSON ─────────────────────────────────────────────────

  const renderConceptLesson = () => {
    const content = lessonContent?.content || {};

    const copyCode = () => {
      if (content.syntax?.code) {
        navigator.clipboard.writeText(content.syntax.code);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Hero Header */}
        <motion.div variants={slideUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--page-accent)]/10 via-[var(--page-accent-secondary)]/5 to-transparent border border-[var(--page-border)]">
          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-lg flex-shrink-0">
                <FaBook className="text-white text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-[var(--page-accent)] uppercase tracking-wider">Concept Lesson</span>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--page-text)] mt-1 leading-tight">{currentLesson?.title}</h1>
              </div>
            </div>
            {content.explanation && (
              <div className="mt-4 text-[var(--page-text-muted)] leading-relaxed text-sm sm:text-base">
                <RichTextRenderer content={content.explanation} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Real-World Analogy */}
        {content.analogy && (
          <motion.div variants={slideUp} className="relative rounded-2xl border border-amber-200/60 dark:border-amber-800/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10" />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md flex-shrink-0">
                  <FaLightbulb className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-3">Real-World Analogy</h3>
                  <div className="bg-white/60 dark:bg-amber-900/20 backdrop-blur-sm rounded-xl p-5 border border-amber-200/60 dark:border-amber-700/30">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">{content.analogy.title}</h4>
                    <p className="text-amber-900 dark:text-amber-100 leading-relaxed text-sm">{content.analogy.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Syntax / Code Example */}
        {content.syntax && (
          <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--page-text)] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FaCode className="text-green-600 dark:text-green-400" />
                  </div>
                  {content.syntax.title || 'Syntax'}
                </h3>
                <button
                  onClick={copyCode}
                  className="px-3 py-1.5 bg-[var(--page-section)] hover:bg-[var(--page-border)] text-[var(--page-text-muted)] rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <><FaCheck className="text-green-500" /> Copied!</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy</>
                  )}
                </button>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-gray-700">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-400 ml-2 font-mono">main.py</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{programmingLanguage}</span>
                </div>
                <pre className="p-5 bg-gray-900 text-sm text-gray-100 font-mono leading-relaxed overflow-x-auto">{content.syntax.code}</pre>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Takeaways */}
        {content.keyNotes && content.keyNotes.length > 0 && (
          <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-section)]/50 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[var(--page-text)] mb-5 flex items-center gap-2">
              <FaCheckDouble className="text-[var(--page-accent)]" />
              Key Takeaways
            </h3>
            <div className="grid gap-3">
              {content.keyNotes.map((note: string, i: number) => (
                <motion.div
                  key={i}
                  variants={slideInLeft}
                  className="flex items-start gap-3 p-4 bg-[var(--page-card)] rounded-xl border border-[var(--page-border)] hover:border-[var(--page-accent)]/20 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <p className="text-[var(--page-text)] leading-relaxed text-sm flex-1">{note}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation Footer */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 pb-8">
          <button
            onClick={() => navigateLesson('prev')}
            disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
            className="px-5 py-2.5 text-[var(--page-text-muted)] hover:text-[var(--page-text)] bg-[var(--page-card)] border border-[var(--page-border)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2 font-medium transition-all hover:shadow-sm"
          >
            <FaChevronLeft className="text-xs" /> Previous
          </button>

          {!isLessonCompleted(currentLesson?._id) ? (
            <button
              onClick={() => markLessonComplete()}
              className="px-8 py-3 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white rounded-xl font-semibold shadow-lg shadow-[var(--page-accent)]/20 hover:shadow-xl hover:shadow-[var(--page-accent)]/30 transition-all flex items-center justify-center gap-2"
            >
              <FaCheck className="text-sm" />
              Mark as Complete
            </button>
          ) : (
            <div className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md">
              <FaCheck className="text-lg" /> Completed
            </div>
          )}

          <button
            onClick={() => navigateLesson('next')}
            className="px-5 py-2.5 text-[var(--page-text-muted)] hover:text-[var(--page-text)] bg-[var(--page-card)] border border-[var(--page-border)] rounded-xl flex items-center justify-center gap-2 font-medium transition-all hover:shadow-sm"
          >
            Next <FaChevronRight className="text-xs" />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  // ── RENDER: MCQ LESSON ─────────────────────────────────────────────────────

  const renderMCQLesson = () => {
    const content = lessonContent?.content || {};
    const options = content.options || [];

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Problem */}
          <motion.div variants={slideInLeft} className="space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)]">
              <h1 className="text-lg font-bold text-[var(--page-text)] mb-4">{content.problemTitle || content.problem || currentLesson?.title}</h1>

              {content.question && (
                <div>
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Question</span>
                  <div className="p-4 bg-[var(--page-section)] rounded-xl border border-[var(--page-border)]">
                    <pre className="text-[var(--page-text)] text-sm leading-relaxed whitespace-pre-wrap font-sans">{content.question}</pre>
                  </div>
                </div>
              )}

              {content.hint && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Hint</span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                    <p className="text-amber-800 dark:text-amber-200 text-sm">{content.hint}</p>
                  </div>
                </div>
              )}

              {content.commonDoubts && (
                <div className="mt-4">
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Common Doubts</span>
                  <div className="space-y-2">
                    {Array.isArray(content.commonDoubts) ? (
                      content.commonDoubts.map((doubt: string, i: number) => (
                        <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                          <p className="text-blue-700 dark:text-blue-300 text-sm">{doubt}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                        <p className="text-blue-700 dark:text-blue-300 text-sm">{content.commonDoubts}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Options */}
          <motion.div variants={slideInRight} className="space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)]">
              <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-4 block">Select Your Answer</span>

              <div className="space-y-3">
                {options.map((option: string, index: number) => {
                  const hasLetterPrefix = /^[A-D]\)/.test(option);
                  const optionLetter = hasLetterPrefix ? option.charAt(0) : String.fromCharCode(65 + index);
                  const optionText = hasLetterPrefix ? option.substring(3).trim() : option.trim();
                  const isSelected = selectedAnswer === optionLetter;

                  const correctAnswerLetter = typeof content.correctAnswer === 'number'
                    ? String.fromCharCode(65 + content.correctAnswer)
                    : content.correctAnswer;
                  const isCorrectOption = optionLetter === correctAnswerLetter;

                  let stateClasses = 'border-[var(--page-border)] bg-[var(--page-card)]';
                  if (mcqSubmitted) {
                    if (isCorrectOption) stateClasses = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                    else if (isSelected && !isCorrectOption) stateClasses = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                  } else if (isSelected) {
                    stateClasses = 'border-[var(--page-accent)] bg-[var(--page-accent-soft)]';
                  }

                  return (
                    <button
                      key={optionLetter}
                      onClick={() => !mcqSubmitted && setSelectedAnswer(optionLetter)}
                      disabled={mcqSubmitted}
                      className={`w-full text-left p-4 rounded-xl border-2 ${stateClasses} hover:border-[var(--page-accent)]/40 transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${isSelected && !mcqSubmitted ? 'border-[var(--page-accent)] bg-[var(--page-accent)] text-white' : 'border-[var(--page-border)] text-[var(--page-text-muted)]'}`}>
                          {optionLetter}
                        </div>
                        <span className="text-[var(--page-text)] text-sm">{optionText}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {mcqSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-5 p-4 rounded-xl border ${mcqCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}
                >
                  <p className={`text-sm font-medium ${mcqCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {mcqCorrect ? 'Correct! Well done.' : `Incorrect. The correct answer is ${content.correctAnswer}.`}
                  </p>
                  {content.explanation && (
                    <p className="text-[var(--page-text-muted)] text-sm mt-2">{content.explanation}</p>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3 mt-6">
                {!mcqSubmitted ? (
                  <button
                    onClick={handleMCQSubmit}
                    disabled={!selectedAnswer}
                    className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${selectedAnswer ? 'bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white shadow-md' : 'bg-[var(--page-section)] text-[var(--page-text-muted)] cursor-not-allowed'}`}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={() => { setSelectedAnswer(null); setMcqSubmitted(false); setMcqCorrect(null); }}
                    className="flex-1 py-2.5 rounded-xl font-medium text-sm border border-[var(--page-border)] text-[var(--page-text)] hover:bg-[var(--page-section)] transition-all"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigateLesson('next')}
                  className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-[var(--page-text)] text-[var(--page-bg)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  Next <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ── RENDER: CODING LESSON ──────────────────────────────────────────────────

  const renderCodingLesson = () => {
    const content = lessonContent?.content || {};
    const problemTitle = content.problemTitle || content.problem || currentLesson?.title;
    const problemStatement = content.problemStatement || content.description || '';

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT: Problem */}
          <motion.div variants={slideInLeft} className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)]">
              <h1 className="text-lg font-bold text-[var(--page-text)] mb-4">{problemTitle}</h1>

              {problemStatement && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Problem Statement</span>
                  <div className="p-4 bg-[var(--page-section)] rounded-xl border border-[var(--page-border)]">
                    <pre className="text-[var(--page-text)] text-sm leading-relaxed whitespace-pre-wrap font-sans">{problemStatement}</pre>
                  </div>
                </div>
              )}

              {content.examples && (
                <div className="mb-4">
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Examples</span>
                  <div className="space-y-2">
                    {content.examples.map((ex: any, i: number) => (
                      <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Example {i + 1}</p>
                        <p className="text-sm text-[var(--page-text)]"><strong>Input:</strong> {ex.input}</p>
                        <p className="text-sm text-[var(--page-text)]"><strong>Output:</strong> {ex.output}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.constraints && (
                <div>
                  <span className="text-xs font-semibold text-[var(--page-text-muted)] uppercase tracking-wider mb-2 block">Constraints</span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
                    <pre className="text-amber-800 dark:text-amber-200 text-xs font-mono whitespace-pre-wrap">{content.constraints}</pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Editor */}
          <motion.div variants={slideInRight} className="lg:col-span-3 flex flex-col">
            <div className="flex-1 flex flex-col rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] overflow-hidden">
              <div className="h-[400px] lg:flex-1 min-h-[300px]">
                <Editor
                  height="100%"
                  language={programmingLanguage.toLowerCase()}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              {output && (
                <div className="border-t border-[var(--page-border)] p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-y-auto max-h-40">
                  <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
              )}

              <div className="p-4 border-t border-[var(--page-border)] bg-[var(--page-section)] flex gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center gap-2 transition-all"
                >
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // ── RENDER: MODULE TEST ────────────────────────────────────────────────────

  const renderModuleTest = () => {
    const content = lessonContent?.content || {};
    const questions = content.questions || [];

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] overflow-hidden">
          {/* Test Header */}
          <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600">
            <h1 className="text-xl font-bold text-white mb-1">{content.title || currentLesson?.title}</h1>
            <p className="text-purple-200 text-sm">{questions.length} Questions</p>
          </div>

          <div className="p-6 bg-[var(--page-card)]">
            {testSubmitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="text-5xl mb-4">{testScore >= 70 ? '\uD83C\uDF89' : '\uD83D\uDCDA'}</div>
                <h2 className="text-2xl font-bold text-[var(--page-text)] mb-2">Score: {testScore}%</h2>
                <p className="text-[var(--page-text-muted)] mb-6">
                  You got {Object.values(testAnswers).filter((ans, i) => ans === questions[i]?.correctAnswer).length} out of {questions.length} correct
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { setTestAnswers({}); setTestSubmitted(false); setTestScore(0); }}
                    className="px-6 py-2.5 rounded-xl font-medium border border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                  >
                    Retry Test
                  </button>
                  <button
                    onClick={() => navigateLesson('next')}
                    className="px-6 py-2.5 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-700 transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="space-y-5">
                  {questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-5 border border-[var(--page-border)] rounded-xl">
                      <h3 className="font-semibold text-[var(--page-text)] mb-3 text-sm">
                        {idx + 1}. {q.question}
                      </h3>
                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${testAnswers[idx] === optIdx ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-[var(--page-border)] hover:bg-[var(--page-section)]'}`}
                          >
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              checked={testAnswers[idx] === optIdx}
                              onChange={() => setTestAnswers({ ...testAnswers, [idx]: optIdx })}
                              className="w-4 h-4 text-purple-600 accent-purple-600"
                            />
                            <span className="text-[var(--page-text)] text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleTestSubmit}
                  disabled={Object.keys(testAnswers).length < questions.length}
                  className={`w-full mt-6 py-3 rounded-xl font-medium transition-all ${Object.keys(testAnswers).length === questions.length ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-lg' : 'bg-[var(--page-section)] text-[var(--page-text-muted)] cursor-not-allowed'}`}
                >
                  Submit Test ({Object.keys(testAnswers).length}/{questions.length} answered)
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ── RENDER: COMPLETION SCREEN ──────────────────────────────────────────────

  const renderCompletionScreen = () => {
    const content = lessonContent?.content || {};
    const totalLessons = course?.sections?.reduce(
      (acc: number, s: any) => acc + (s.lessons?.length || 0), 0
    ) || 0;

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <motion.div variants={scaleIn} className="rounded-2xl border border-[var(--page-border)] overflow-hidden text-center">
          {/* Hero */}
          <div className="relative p-10 bg-gradient-to-r from-[var(--page-accent)] via-[var(--page-accent-secondary)] to-yellow-400 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="absolute w-20 h-20 border-2 border-white rounded-full" style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-white text-2xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{content.message || 'Congratulations!'}</h1>
              <p className="text-white/80">You've completed this course!</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                <div className="text-xl font-bold text-[var(--page-accent)]">{totalLessons}</div>
                <div className="text-[10px] text-[var(--page-text-muted)] font-medium">Lessons</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                <div className="text-xl font-bold text-green-600">+{Math.max(totalLessons * 50, 100)}</div>
                <div className="text-[10px] text-[var(--page-text-muted)] font-medium">XP Earned</div>
              </div>
              <div className="p-3 rounded-xl bg-[var(--page-section)] border border-[var(--page-border)]">
                <div className="text-xl font-bold text-blue-600">{formatSessionTime(sessionSeconds)}</div>
                <div className="text-[10px] text-[var(--page-text-muted)] font-medium">Time</div>
              </div>
            </div>

            {content.summary && (
              <div className="text-left">
                <h3 className="font-bold text-[var(--page-text)] mb-3 text-sm">What you learned:</h3>
                <ul className="space-y-2">
                  {content.summary.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--page-text-muted)] text-sm">
                      <FaCheck className="text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.nextSteps && (
              <div className="text-left">
                <h3 className="font-bold text-[var(--page-text)] mb-3 text-sm">Next Steps:</h3>
                <ul className="space-y-2">
                  {content.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="text-[var(--page-text-muted)] text-sm flex items-start gap-2">
                      <span className="text-[var(--page-accent)] font-bold mt-0.5">\u2192</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Badges */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--page-accent-soft)] to-amber-50 dark:to-amber-900/10 border border-[var(--page-border)]">
              <p className="text-xs font-bold text-[var(--page-accent)] mb-2 flex items-center justify-center gap-2">
                <FaTrophy /> Achievements Unlocked
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Course Graduate', 'Dedicated Learner'].map((badge) => (
                  <span key={badge} className="px-3 py-1 bg-[var(--page-card)] text-[var(--page-accent)] text-xs font-semibold rounded-full border border-[var(--page-border)] shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--page-border)] bg-[var(--page-section)]">
            <button
              onClick={() => markLessonComplete()}
              className="px-8 py-3 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white rounded-xl font-semibold shadow-lg shadow-[var(--page-accent)]/20 hover:shadow-xl transition-all"
            >
              Complete Course
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ── RENDER: LOADING STATE ──────────────────────────────────────────────────

  if (isLoading && !showSkeleton) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--page-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--page-text-muted)] font-medium text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  // ── RENDER: SKELETON ───────────────────────────────────────────────────────

  if (showSkeleton) {
    return (
      <div className="flex h-screen" style={{ background: 'var(--page-bg)' }}>
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:block w-72 border-r border-[var(--page-border)] flex-shrink-0 overflow-hidden bg-[var(--page-card)]">
          <div className="p-4 space-y-4">
            <div className="h-6 w-3/4 bg-[var(--page-section)] rounded-lg animate-pulse" />
            <div className="h-3 w-1/2 bg-[var(--page-section)] rounded animate-pulse" />
            <div className="h-2 w-full bg-[var(--page-section)] rounded-full animate-pulse" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-2/3 bg-[var(--page-section)] rounded animate-pulse" />
                  <div className="h-3 w-full bg-[var(--page-section)] rounded animate-pulse ml-4" />
                  <div className="h-3 w-3/4 bg-[var(--page-section)] rounded animate-pulse ml-4" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile skeleton */}
        <div className="lg:hidden w-full">
          <div className="p-4 border-b border-[var(--page-border)] bg-[var(--page-card)] flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--page-section)] rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--page-section)] rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-[var(--page-section)] rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <LessonContentSkeleton />
          </div>
        </div>

        {/* Main Content Skeleton (desktop) */}
        <main className="hidden lg:block flex-1 p-6 overflow-hidden">
          <LessonContentSkeleton />
        </main>
      </div>
    );
  }

  // ── DATA CHECKS ────────────────────────────────────────────────────────────

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--page-text)] mb-4">Course not found</h2>
          <a href="/#/dashboard" className="text-[var(--page-accent)] hover:underline text-sm">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const progressPercent = calculateProgress();
  const showSidebar = !currentLesson || lessonType === 'concept' || lessonType === 'completion';
  const isFullWidthLesson = lessonType === 'mcq' || lessonType === 'codingTask' ||
    lessonType === 'coding' || lessonType === 'moduleTest' ||
    lessonType === 'test';

  // ── SIDEBAR ────────────────────────────────────────────────────────────────

  const renderSidebar = () => (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 w-72 h-screen border-r border-[var(--page-border)] bg-[var(--page-card)] z-30 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <LearningSidebar
            course={course}
            currentModuleIndex={currentModuleIndex}
            currentLessonIndex={currentLessonIndex}
            expandedModules={expandedModules}
            isSidebarOpen={isSidebarOpen}
            progress={progress}
            progressPercent={progressPercent}
            sessionSeconds={sessionSeconds}
            formatSessionTime={formatSessionTime}
            onSelectLesson={selectLesson}
            onToggleModule={toggleModule}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onBack={() => window.location.hash = `/course/${courseId}`}
            hasCoursePurchase={hasCoursePurchase}
          />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[var(--page-card)] z-50 shadow-2xl lg:hidden overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--page-border)]">
                <span className="text-sm font-bold text-[var(--page-text)]">Course Content</span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-[var(--page-section)] rounded-xl transition-colors"
                >
                  <FaTimes className="w-4 h-4 text-[var(--page-text-muted)]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <LearningSidebar
                  course={course}
                  currentModuleIndex={currentModuleIndex}
                  currentLessonIndex={currentLessonIndex}
                  expandedModules={expandedModules}
                  isSidebarOpen={isSidebarOpen}
                  progress={progress}
                  progressPercent={progressPercent}
                  sessionSeconds={sessionSeconds}
                  formatSessionTime={formatSessionTime}
                  onSelectLesson={selectLesson}
                  onToggleModule={toggleModule}
                  onCloseSidebar={() => setIsSidebarOpen(false)}
                  onBack={() => window.location.hash = `/course/${courseId}`}
                  hasCoursePurchase={hasCoursePurchase}
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  // ── MOBILE TOP NAV ─────────────────────────────────────────────────────────

  const renderMobileNav = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--page-card)]/80 backdrop-blur-xl border-b border-[var(--page-border)]">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-[var(--page-section)] rounded-xl transition-colors"
        >
          <HiOutlineMenu className="w-5 h-5 text-[var(--page-text)]" />
        </button>

        <div className="flex-1 mx-3 min-w-0">
          <div className="text-sm font-semibold text-[var(--page-text)] truncate">
            {currentLesson ? currentLesson.title : course.title}
          </div>
          {currentLesson && (
            <div className="text-[11px] text-[var(--page-text-muted)] font-medium">
              Module {currentModuleIndex + 1} · Lesson {currentLessonIndex + 1}
            </div>
          )}
        </div>

        {currentLesson && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateLesson('prev')}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="p-2 text-[var(--page-text-muted)] hover:bg-[var(--page-section)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateLesson('next')}
              className="p-2 text-[var(--page-text-muted)] hover:bg-[var(--page-section)] rounded-xl"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── COURSE OVERVIEW ────────────────────────────────────────────────────────

  const renderCourseOverview = () => {
    const milestone = getMilestoneBadge();
    const streakDays = Math.floor(progressPercent / 10);
    const nextMilestone = progressPercent < 25 ? 25 : progressPercent < 50 ? 50 : progressPercent < 75 ? 75 : 100;

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Continue Learning Card */}
        <motion.div variants={slideUp}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FaPlay className="text-white text-xl ml-0.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg sm:text-xl">
                  {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
                </h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {progressPercent > 0
                    ? `You're ${progressPercent}% through - keep the momentum!`
                    : 'Begin your journey with this course'}
                </p>
              </div>
              <button
                onClick={() => {
                  const modules = course?.sections || [];
                  // Find first incomplete lesson
                  for (let m = 0; m < modules.length; m++) {
                    const lessons = modules[m].lessons || [];
                    for (let l = 0; l < lessons.length; l++) {
                      if (!isLessonCompleted(lessons[l]._id)) {
                        selectLesson(lessons[l], m, l);
                        return;
                      }
                    }
                  }
                  // All complete, go to first lesson
                  if (modules[0]?.lessons?.[0]) {
                    selectLesson(modules[0].lessons[0], 0, 0);
                  }
                }}
                className="px-6 py-2.5 bg-white text-[var(--page-accent)] rounded-xl font-semibold text-sm hover:bg-white/90 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                {progressPercent > 0 ? 'Resume' : 'Get Started'}
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main content card */}
        <motion.div variants={slideUp} className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] overflow-hidden">
          {/* Compact Header */}
          <div className="p-6 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => window.location.hash = `/course/${courseId}`}
                    className="text-xs text-[var(--page-text-muted)] hover:text-[var(--page-accent)] font-medium transition-colors"
                  >
                    Course Details
                  </button>
                  <FaChevronRight className="w-2 h-2 text-[var(--page-text-muted)]/40" />
                  <span className="text-xs text-[var(--page-text)] font-semibold">Learning</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--page-text)] leading-tight">{course.title}</h1>
                <p className="text-sm text-[var(--page-text-muted)] mt-1 leading-relaxed line-clamp-2">
                  {course.description || 'Select a lesson from the sidebar to begin learning.'}
                </p>
              </div>
              {milestone && (
                <div className={`bg-gradient-to-r ${milestone.color} px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs font-bold flex-shrink-0`}>
                  {milestone.icon}
                  {milestone.label}
                </div>
              )}
            </div>
          </div>

          {/* Progress + Stats */}
          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[var(--page-border)]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--page-accent)]">{progressPercent}%</div>
              <div className="text-[11px] text-[var(--page-text-muted)] font-medium">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--page-text)]">
                {progress?.completedLessons?.length || 0}
              </div>
              <div className="text-[11px] text-[var(--page-text-muted)] font-medium">Lessons Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--page-text)]">
                {course?.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0}
              </div>
              <div className="text-[11px] text-[var(--page-text-muted)] font-medium">Total Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{streakDays}</div>
              <div className="text-[11px] text-[var(--page-text-muted)] font-medium">Streak Days</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pb-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--page-text)]">Course Progress</span>
              <span className="text-xs text-[var(--page-text-muted)]">{nextMilestone}% until next milestone</span>
            </div>
            <div className="h-3 bg-[var(--page-section)] rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] rounded-full"
              />
            </div>
            <p className="text-xs text-[var(--page-text-muted)] mt-2">
              {progressPercent >= 50 ? 'Great progress! Almost there.' : 'Keep going! You\'re making great strides.'}
            </p>
          </div>
        </motion.div>

        {/* Modules Grid */}
        <motion.div variants={slideUp} className="space-y-3">
          <h2 className="text-lg font-bold text-[var(--page-text)] px-1">Course Modules</h2>
          <div className="grid gap-3">
            {course.sections.map((module: any, idx: number) => {
              const moduleProgress = module.lessons?.filter((l: any) =>
                isLessonCompleted(l._id)
              ).length || 0;
              const totalLessons = module.lessons?.length || 0;
              const progressPct = totalLessons > 0 ? (moduleProgress / totalLessons) * 100 : 0;

              return (
                <motion.div
                  key={idx}
                  variants={slideInLeft}
                  className="p-5 rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] hover:border-[var(--page-accent)]/20 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-[var(--page-accent)] uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        {progressPct === 100 && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                            Complete
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-[var(--page-text)] leading-snug">{module.title}</h3>
                    </div>

                    {/* Circular progress indicator */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--page-border)" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.5" fill="none"
                          stroke={progressPct === 100 ? '#10b981' : 'var(--page-accent)'}
                          strokeWidth="2.5" strokeLinecap="round"
                          strokeDasharray={`${(progressPct / 100) * 97.4} 97.4`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--page-text)]">
                        {moduleProgress}/{totalLessons}
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-[var(--page-section)] rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] rounded-full"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (module.lessons?.[0]) {
                        selectLesson(module.lessons[0], idx, 0);
                      }
                    }}
                    className="text-xs text-[var(--page-accent)] hover:text-[var(--page-accent)]/80 font-semibold flex items-center gap-1.5 group"
                  >
                    {progressPct === 0 ? 'Start Module' : 'Continue'}
                    <FaChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ── MAIN RENDER ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: 'var(--page-bg)' }}>
      {renderSidebar()}

      {/* Mobile Nav */}
      {!isFocusMode && renderMobileNav()}

      {/* Main Content */}
      <main className={`
        pt-16 lg:pt-0 min-h-screen
        ${showSidebar ? 'lg:ml-72' : ''}
      `}>
        <div className={`
          ${isFullWidthLesson ? 'max-w-7xl' : 'max-w-5xl'}
          mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8
        `}>
          {/* Desktop breadcrumb + nav */}
          {currentLesson && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setCurrentLesson(null);
                    setCurrentModuleIndex(-1);
                    setCurrentLessonIndex(-1);
                  }}
                  className="text-[var(--page-text-muted)] hover:text-[var(--page-accent)] font-medium transition-colors"
                >
                  Course Overview
                </button>
                <FaChevronRight className="w-2.5 h-2.5 text-[var(--page-text-muted)]/40" />
                <span className="text-[var(--page-text-muted)]">Module {currentModuleIndex + 1}</span>
                <FaChevronRight className="w-2.5 h-2.5 text-[var(--page-text-muted)]/40" />
                <span className="text-[var(--page-text)] font-semibold">Lesson {currentLessonIndex + 1}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--page-section)] rounded-xl text-xs font-semibold text-[var(--page-text-muted)]">
                  <FaClock className="w-3 h-3 text-[var(--page-accent)]" />
                  <span>{formatSessionTime(sessionSeconds)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsFocusMode(prev => !prev);
                    toast.success(isFocusMode ? 'Focus mode off' : 'Focus mode on');
                  }}
                  className={`p-2 rounded-xl transition-all ${isFocusMode ? 'bg-[var(--page-accent)] text-white shadow-md' : 'bg-[var(--page-section)] text-[var(--page-text-muted)] hover:bg-[var(--page-border)]'}`}
                  title="Toggle focus mode"
                >
                  {isFocusMode ? <FaMoon className="w-3.5 h-3.5" /> : <FaSun className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setShowShortcuts(prev => !prev)}
                  className="p-2 bg-[var(--page-section)] text-[var(--page-text-muted)] hover:bg-[var(--page-border)] rounded-xl transition-all"
                  title="Keyboard shortcuts"
                >
                  <FaKeyboard className="w-3.5 h-3.5" />
                </button>

                <div className="w-px h-4 bg-[var(--page-border)]" />

                <button
                  onClick={() => navigateLesson('prev')}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="px-3 py-1.5 text-[var(--page-text-muted)] hover:text-[var(--page-text)] hover:bg-[var(--page-section)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all font-medium text-xs flex items-center gap-1.5"
                >
                  <FaChevronLeft className="w-2.5 h-2.5" />
                  Prev
                </button>
                <button
                  onClick={() => navigateLesson('next')}
                  className="px-3 py-1.5 bg-[var(--page-accent)] hover:bg-[var(--page-accent)]/90 text-white rounded-xl transition-all font-medium text-xs flex items-center gap-1.5 shadow-sm"
                >
                  Next
                  <FaChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Content Area */}
          {!currentLesson ? (
            renderCourseOverview()
          ) : isCurrentLessonLocked ? (
            <PremiumContentLock
              courseName={course?.title || 'This Course'}
              originalPrice={course?.price || 2999}
              discountPrice={course?.discountPrice || 1499}
              premiumFeatures={course?.premiumFeatures || [
                'Full course access',
                'All problem solutions',
                'Mock tests',
                'Certificate of completion',
                'Lifetime access'
              ]}
              courseId={courseId}
              lessonTitle={currentLesson?.title}
              variant="full"
              onUpgrade={() => {
                api.post('/analytics/event', {
                  eventType: 'upgrade_cta_click',
                  courseId,
                  sessionId: analyticsSessionId,
                  metadata: {
                    lessonId: currentLesson?._id,
                    lessonTitle: currentLesson?.title,
                    source: 'lesson_lock'
                  }
                }).catch(() => undefined);
              }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-[var(--page-border)] bg-[var(--page-card)] overflow-hidden"
            >
              {/* Lesson Header */}
              <div className="p-5 sm:p-6 lg:p-8 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-md flex-shrink-0">
                    <span className="text-white text-sm">{getLessonIcon(currentLesson.description)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold text-[var(--page-text)] leading-tight">
                        {currentLesson.title}
                      </h1>
                      {currentLesson.isPreview && (
                        <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold rounded-full">
                          FREE PREVIEW
                        </span>
                      )}
                    </div>
                    {currentLesson.description && (
                      <div className="text-[var(--page-text-muted)] text-sm leading-relaxed">
                        <RichTextRenderer content={currentLesson.description} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Body */}
              <div className="p-4 sm:p-6 lg:p-8">
                {lessonType === 'concept' && renderConceptLesson()}
                {lessonType === 'mcq' && renderMCQLesson()}
                {(lessonType === 'coding' || lessonType === 'codingTask') && renderCodingLesson()}
                {(lessonType === 'test' || lessonType === 'moduleTest') && renderModuleTest()}
                {lessonType === 'completion' && renderCompletionScreen()}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {currentLesson && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--page-card)] border-t border-[var(--page-border)] p-3 flex items-center gap-3 z-20 safe-area-bottom">
          <button
            onClick={() => navigateLesson('prev')}
            disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
            className="flex-1 py-2.5 bg-[var(--page-section)] hover:bg-[var(--page-border)] disabled:opacity-30 disabled:cursor-not-allowed text-[var(--page-text)] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <FaChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <button
            onClick={() => navigateLesson('next')}
            className="flex-1 py-2.5 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md"
          >
            Next
            <FaChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* AI Floating Panel */}
      {currentLesson && <AIFloatingPanel currentLesson={currentLesson} />}

      {/* Milestone badge */}
      {milestone && (
        <MilestoneBadge
          type={milestone.type}
          duration={2500}
          onDismiss={() => setMilestone(null)}
        />
      )}

      {/* Focus mode overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)'
          }} />
        </div>
      )}

      {/* Keyboard Shortcuts */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--page-card)] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[var(--page-border)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[var(--page-text)] flex items-center gap-2">
                  <FaKeyboard className="text-[var(--page-accent)]" />
                  Keyboard Shortcuts
                </h3>
                <button onClick={() => setShowShortcuts(false)} className="p-1.5 hover:bg-[var(--page-section)] rounded-lg transition-colors">
                  <FaTimes className="w-4 h-4 text-[var(--page-text-muted)]" />
                </button>
              </div>
              <div className="space-y-1.5">
                {[
                  { keys: ['Alt', '\u2190'], desc: 'Previous lesson' },
                  { keys: ['Alt', '\u2192'], desc: 'Next lesson' },
                  { keys: ['F'], desc: 'Toggle focus mode' },
                  { keys: ['S'], desc: 'Toggle sidebar' },
                  { keys: ['Esc'], desc: 'Close panel / exit focus' },
                  { keys: ['?'], desc: 'Toggle this panel' },
                ].map(({ keys, desc }) => (
                  <div key={desc} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[var(--page-section)] transition-colors">
                    <span className="text-sm text-[var(--page-text)]">{desc}</span>
                    <div className="flex items-center gap-1">
                      {keys.map((k, i) => (
                        <kbd key={i} className="px-2 py-0.5 bg-[var(--page-section)] border border-[var(--page-border)] rounded-lg text-[11px] font-mono font-semibold text-[var(--page-text-muted)]">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[11px] text-[var(--page-text-muted)]/60 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-[var(--page-section)] rounded text-[var(--page-text-muted)] font-mono">?</kbd> anytime to toggle
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone toast */}
      {!isFocusMode && (() => {
        const ms = getMilestoneBadge();
        if (!ms || progressPercent < 100) return null;
        return (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`bg-gradient-to-r ${ms.color} px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-lg font-bold`}
            >
              {ms.icon}
              <span>{ms.label}</span>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );
};

export default LearningPage;
