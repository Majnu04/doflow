import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { recordLessonCompletion } from '../src/store/slices/gamificationSlice';
import api from '../src/utils/api';
import Editor from '@monaco-editor/react';
import { 
  FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCheck, 
  FaPlay, FaBook, FaCode, FaQuestionCircle, FaLaptopCode, FaLightbulb, 
  FaClipboardList, FaBars, FaTimes, FaLock, FaCrown, FaMoon, FaSun,
  FaKeyboard, FaTrophy, FaClock
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

interface LearningPageProps {
  courseId: string;
}

interface LessonContent {
  type: string;
  content: any;
  hideSidebar?: boolean;
}

/**
 * PROFESSIONAL LEARNING PAGE
 * Design Principles:
 * - Clean SaaS design with strong visual hierarchy
 * - Mobile-first responsive with sidebar→drawer on mobile
 * - Inter font family for professional typography
 * - 8px spacing system for consistency
 * - Accessible contrast (WCAG AA compliant)
 * - Smooth animations and transitions
 * - Touch-friendly interactive elements (min 44x44px)
 */
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  const [userPurchases, setUserPurchases] = useState<string[]>([]); // Courses user has purchased
  
  // Skeleton loading with minimum display time (prevents flash)
  const showSkeleton = useMinimumLoadingTime(isLoading, 500);
  
  // MCQ State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqCorrect, setMcqCorrect] = useState<boolean | null>(null);
  
  // Module Test State
  const [testAnswers, setTestAnswers] = useState<{[key: number]: number}>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // Coding State
  const [code, setCode] = useState('# Write your Python code here\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  // UI State
  const [copiedCode, setCopiedCode] = useState(false);

  // Session timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionStartRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Focus mode
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Keyboard shortcuts visibility
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Milestone badge trigger
  const [milestone, setMilestone] = useState<{ type: 'lesson-complete' | 'module-complete' | 'course-complete' } | null>(null);

  const analyticsSessionId = React.useMemo(() => {
    const key = 'doflow_session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, newId);
    return newId;
  }, []);

  // ── Session Timer ────────────────────────────────────────────────────────
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

  // ── Keyboard Shortcuts ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      // ? — toggle shortcuts panel
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Escape — close sidebar / shortcuts panel / focus mode
      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return; }
        if (isSidebarOpen) { setIsSidebarOpen(false); return; }
        if (isFocusMode) { setIsFocusMode(false); return; }
        return;
      }

      // Arrow keys — navigate lessons
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

      // F — toggle focus mode
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsFocusMode(prev => !prev);
        toast.success(isFocusMode ? 'Focus mode off' : 'Focus mode on — distractions hidden');
        return;
      }

      // S — toggle sidebar (desktop)
      if (e.key === 's' && !e.ctrlKey && !e.metaKey && window.innerWidth >= 1024) {
        e.preventDefault();
        setIsSidebarOpen(prev => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isFocusMode, showShortcuts, currentModuleIndex, currentLessonIndex, course]);

  // Detect programming language
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

  // Parse lesson content
  const getLessonContent = (lesson: any): LessonContent | null => {
    if (!lesson?.resources?.[0]?.url) return null;
    try {
      return JSON.parse(lesson.resources[0].url);
    } catch {
      return null;
    }
  };

  // Get lesson type
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

  // Get lesson icon
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

  // Calculate progress
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

  // Select lesson
  const selectLesson = (lesson: any, moduleIdx: number, lessonIdx: number) => {
    setCurrentLesson(lesson);
    setCurrentModuleIndex(moduleIdx);
    setCurrentLessonIndex(lessonIdx);
    setSelectedAnswer(null);
    setMcqSubmitted(false);
    setMcqCorrect(null);
    setIsSidebarOpen(false); // Close mobile drawer
  };

  // Navigate lessons
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

  // Mark lesson complete
  const markLessonComplete = async () => {
    if (!currentLesson) return;
    try {
      await api.post('/progress', {
        courseId,
        lessonId: currentLesson._id,
        isCompleted: true
      });
      toast.success('Lesson marked complete!');

      // Determine milestone type
      const newCompletedCount = (progress?.completedLessons?.length || 0) + 1;
      const totalLessons = course?.sections?.reduce(
        (acc: number, s: any) => acc + (s.lessons?.length || 0), 0
      ) || 1;

      if (newCompletedCount >= totalLessons) {
        setMilestone({ type: 'course-complete' });
      } else {
        // Check if current module is now complete
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

  // Toggle module expansion
  const toggleModule = (idx: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedModules(newExpanded);
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  // Milestone badges based on progress
  const getMilestoneBadge = (): { label: string; color: string; icon: React.ReactNode } | null => {
    const pct = calculateProgress();
    if (pct >= 100) return { label: 'Course Complete!', color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    if (pct >= 75) return { label: 'Almost There!', color: 'bg-gradient-to-r from-orange-400 to-red-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    if (pct >= 50) return { label: 'Halfway Hero', color: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    if (pct >= 25) return { label: 'Good Start', color: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    if (pct > 0) return { label: 'First Steps', color: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white', icon: <FaTrophy className="w-4 h-4" /> };
    return null;
  };

  // ============================================================================
  // PREMIUM ACCESS CONTROL - MONETIZATION LOGIC
  // ============================================================================
  
  // Check if user has purchased the course
  const hasCoursePurchase = (): boolean => {
    if (!course) return false;
    // If course is free, everyone has access
    if (!course.isPremium && course.price === 0) return true;
    // Check if course is in user's purchases
    return userPurchases.includes(courseId) || userPurchases.includes(course._id);
  };

  // Check if lesson requires premium access
  const isLessonLocked = (lesson: any): boolean => {
    if (!lesson) return false;
    // If lesson is marked as preview, it's always accessible
    if (lesson.isPreview) return false;
    // If lesson is premium-only and user hasn't purchased
    if (lesson.isPremiumOnly && !hasCoursePurchase()) return true;
    return false;
  };

  // Get lesson content and type
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

  // ============================================================================
  // INTERACTION HANDLERS
  // ============================================================================

  // Handle MCQ submit
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

  // Handle Module Test submit
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

  // Handle code run
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
          setOutput(prev => prev + `\n\n⏱️ Execution time: ${result.executionTime}ms`);
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

  // Handle code submit
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
              results += `✅ Passed\n`;
              results += `Output: ${actualOutput}\n\n`;
            } else {
              failed++;
              results += `❌ Failed\n`;
              results += `Expected: ${expectedOutput}\n`;
              results += `Got: ${actualOutput}\n\n`;
            }
          } else {
            failed++;
            results += `❌ Runtime Error\n`;
            results += `Error: ${result.error || 'Unknown error'}\n\n`;
          }
        } catch (error: any) {
          failed++;
          results += `❌ Execution Error\n`;
          results += `Error: ${error.message}\n\n`;
        }
      }

      results += `\n${'='.repeat(50)}\n`;
      results += `Results: ${passed}/${testCases.length} test cases passed\n`;

      if (passed === testCases.length) {
        results += `\n🎉 All test cases passed! Your solution has been accepted.`;
        markLessonComplete();
        toast.success('Congratulations! All test cases passed!');
      } else {
        results += `\n⚠️ Some test cases failed. Keep trying!`;
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

  // ============================================================================
  // LESSON RENDER FUNCTIONS
  // ============================================================================

  /**
   * Render Concept Lesson - Enhanced UI with hero header, code blocks, analogies
   */
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
      <div className="max-w-5xl mx-auto animate-fadeIn px-2 sm:px-0">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Hero Header with Gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"></div>
            <div className="relative p-5 sm:p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <FaBook className="text-white text-lg sm:text-xl" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Concept Lesson</span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1">{currentLesson?.title}</h1>
                </div>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                {content.explanation ? <RichTextRenderer content={content.explanation} /> : currentLesson?.description ? <RichTextRenderer content={currentLesson.description} /> : null}
              </p>
            </div>
          </div>
          
          {/* Real-World Analogy */}
          {content.analogy && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 to-orange-100/50 opacity-50"></div>
              <div className="relative p-5 sm:p-8 md:p-10 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm border-y border-amber-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                  <div className="relative mx-auto sm:mx-0">
                    <div className="absolute inset-0 bg-amber-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                      <FaLightbulb className="text-white text-2xl animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                      Real-World Analogy
                      <span className="text-sm font-normal text-amber-600">(Understand it better!)</span>
                    </h3>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-amber-200 shadow-sm">
                      <h4 className="font-semibold text-amber-800 mb-2">{content.analogy.title}</h4>
                      <p className="text-amber-900 leading-relaxed">{content.analogy.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Syntax / Code Example */}
          {content.syntax && (
            <div className="p-5 sm:p-8 md:p-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FaCode className="text-green-600 text-lg" />
                  </div>
                  {content.syntax.title || 'Python Syntax'}
                </h3>
                <button
                  onClick={copyCode}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2 group"
                >
                  {copiedCode ? (
                    <>
                      <FaCheck className="text-green-500" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
              </div>
              <div className="relative group/code">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
                  {/* Code Editor Header */}
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-800/50 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-sm text-gray-400 ml-3 font-mono">main.py</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{programmingLanguage}</span>
                  </div>
                  {/* Code Content */}
                  <div className="p-6 overflow-x-auto">
                    <pre className="text-sm text-gray-100 font-mono leading-relaxed">{content.syntax.code}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Key Notes */}
          {content.keyNotes && content.keyNotes.length > 0 && (
            <div className="p-5 sm:p-8 md:p-10 bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-orange-900">Key Takeaways</h3>
              </div>
              <div className="grid gap-3">
                {content.keyNotes.map((note: string, i: number) => (
                  <div 
                    key={i} 
                    className="group bg-white rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all transform hover:-translate-y-0.5"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <span className="text-white text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-orange-900 leading-relaxed flex-1">{note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 max-w-4xl mx-auto">
              <div className="flex justify-between gap-2 sm:hidden">
                <button
                  onClick={() => navigateLesson('prev')}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md flex-1"
                >
                  <FaChevronLeft className="text-sm" /> Prev
                </button>
                <button
                  onClick={() => navigateLesson('next')}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl flex items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md flex-1"
                >
                  Next <FaChevronRight className="text-sm" />
                </button>
              </div>

              <button
                onClick={() => navigateLesson('prev')}
                disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                className="hidden sm:flex px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
              >
                <FaChevronLeft className="text-sm" /> Previous
              </button>
              
              {!isLessonCompleted(currentLesson?._id) ? (
                <button
                  onClick={() => markLessonComplete()}
                  className="px-6 sm:px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all transform hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaCheck className="text-sm" />
                  <span className="hidden sm:inline">Mark as Complete</span>
                  <span className="sm:hidden">Complete</span>
                </button>
              ) : (
                <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg w-full sm:w-auto">
                  <FaCheck className="text-lg" /> Completed
                </div>
              )}

              <button
                onClick={() => navigateLesson('next')}
                className="hidden sm:flex px-5 py-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl items-center gap-2 font-medium transition-all shadow-sm hover:shadow-md"
              >
                Next <FaChevronRight className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render MCQ Lesson - Multiple choice questions with radio selection
   */
  const renderMCQLesson = () => {
    const content = lessonContent?.content || {};
    const options = content.options || [];

    return (
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* LEFT: Problem Statement */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{content.problemTitle || content.problem || currentLesson?.title}</h1>

            {/* Question */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Question</h2>
              <div className="p-3 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <pre className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans break-words">{content.question}</pre>
              </div>
            </div>

            {/* Hint */}
            {content.hint && (
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">💡 Hint</h2>
                <p className="text-gray-600 text-sm bg-amber-50 p-3 sm:p-4 rounded-xl border border-amber-100">{content.hint}</p>
              </div>
            )}

            {/* Common Doubts */}
            {content.commonDoubts && (
              <div>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">🤔 Common Doubts</h2>
                <div className="space-y-2 sm:space-y-3">
                  {Array.isArray(content.commonDoubts) ? (
                    content.commonDoubts.map((doubt: string, i: number) => (
                      <div key={i} className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-blue-700 text-sm break-words">{doubt}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <p className="text-blue-700 text-sm break-words">{content.commonDoubts}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: MCQ Options */}
        <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">Select Your Answer</h2>

            <div className="space-y-2 sm:space-y-3">
              {options.map((option: string, index: number) => {
                const hasLetterPrefix = /^[A-D]\)/.test(option);
                const optionLetter = hasLetterPrefix ? option.charAt(0) : String.fromCharCode(65 + index);
                const optionText = hasLetterPrefix ? option.substring(3).trim() : option.trim();
                const isSelected = selectedAnswer === optionLetter;
                
                const correctAnswerLetter = typeof content.correctAnswer === 'number' 
                  ? String.fromCharCode(65 + content.correctAnswer)
                  : content.correctAnswer;
                const isCorrectOption = optionLetter === correctAnswerLetter;
                
                let borderColor = 'border-gray-200';
                let bgColor = 'bg-white';
                
                if (mcqSubmitted) {
                  if (isCorrectOption) {
                    borderColor = 'border-green-500';
                    bgColor = 'bg-green-50';
                  } else if (isSelected && !isCorrectOption) {
                    borderColor = 'border-red-500';
                    bgColor = 'bg-red-50';
                  }
                } else if (isSelected) {
                  borderColor = 'border-orange-500';
                  bgColor = 'bg-orange-50';
                }

                return (
                  <button
                    key={optionLetter}
                    onClick={() => !mcqSubmitted && setSelectedAnswer(optionLetter)}
                    disabled={mcqSubmitted}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 ${borderColor} ${bgColor} hover:border-orange-300 transition-all`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-sm sm:text-base font-medium flex-shrink-0 ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-300 text-gray-500'}`}>
                        {optionLetter}
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base break-words">{optionText}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Result */}
            {mcqSubmitted && (
              <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border ${mcqCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <p className={`text-sm sm:text-base font-medium ${mcqCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {mcqCorrect ? '✅ Correct! Well done.' : `❌ Incorrect. The correct answer is ${content.correctAnswer}.`}
                </p>
                {content.explanation && (
                  <p className="text-gray-600 text-sm mt-2 break-words">{content.explanation}</p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              {!mcqSubmitted ? (
                <button
                  onClick={handleMCQSubmit}
                  disabled={!selectedAnswer}
                  className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium transition-colors ${selectedAnswer ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={() => { setSelectedAnswer(null); setMcqSubmitted(false); setMcqCorrect(null); }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={() => navigateLesson('next')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium bg-gray-800 text-white hover:bg-gray-900 flex items-center justify-center gap-2"
              >
                Next <FaChevronRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Coding Lesson - Split screen with problem and Monaco editor
   */
  const renderCodingLesson = () => {
    const content = lessonContent?.content || {};
    const problemTitle = content.problemTitle || content.problem || currentLesson?.title;
    const problemStatement = content.problemStatement || content.description || '';

    return (
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* LEFT: Problem */}
        <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{problemTitle}</h1>
            
            <div className="space-y-4">
              {problemStatement && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problem Statement</h2>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">{problemStatement}</pre>
                  </div>
                </div>
              )}

              {content.examples && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Examples</h2>
                  {content.examples.map((ex: any, i: number) => (
                    <div key={i} className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">Example {i + 1}</p>
                      <p className="text-sm text-gray-700"><strong>Input:</strong> {ex.input}</p>
                      <p className="text-sm text-gray-700"><strong>Output:</strong> {ex.output}</p>
                    </div>
                  ))}
                </div>
              )}

              {content.constraints && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Constraints</h2>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <pre className="text-amber-800 text-xs font-mono whitespace-pre-wrap">{content.constraints}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Code Editor */}
        <div className="w-full lg:w-3/5 flex flex-col">
          <div className="flex-1 flex flex-col">
            <div className="h-64 lg:flex-1">
              <Editor
                height="100%"
                language={programmingLanguage}
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
              <div className="border-t border-gray-200 p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-y-auto max-h-48">
                <pre className="whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={handleSubmitCode}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Module Test - Multi-question test with scoring
   */
  const renderModuleTest = () => {
    const content = lessonContent?.content || {};
    const questions = content.questions || [];

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-500">
            <h1 className="text-2xl font-bold text-white mb-2">{content.title || currentLesson?.title}</h1>
            <p className="text-purple-100">{questions.length} Questions • {content.duration || '30 minutes'}</p>
          </div>

          <div className="p-6">
            {testSubmitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">{testScore >= 70 ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Score: {testScore}%
                </h2>
                <p className="text-gray-600 mb-6">
                  You got {Object.values(testAnswers).filter((ans, i) => ans === questions[i].correctAnswer).length} out of {questions.length} correct
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => { setTestAnswers({}); setTestSubmitted(false); setTestScore(0); }}
                    className="px-6 py-2.5 rounded-lg font-medium border border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Retry Test
                  </button>
                  <button
                    onClick={() => navigateLesson('next')}
                    className="px-6 py-2.5 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {idx + 1}. {q.question}
                      </h3>
                      <div className="space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              checked={testAnswers[idx] === optIdx}
                              onChange={() => setTestAnswers({ ...testAnswers, [idx]: optIdx })}
                              className="w-4 h-4 text-purple-600"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleTestSubmit}
                    disabled={Object.keys(testAnswers).length < questions.length}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${Object.keys(testAnswers).length === questions.length ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    Submit Test ({Object.keys(testAnswers).length}/{questions.length} answered)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Completion Screen - Congratulations message with celebration
   */
  const renderCompletionScreen = () => {
    const content = lessonContent?.content || {};
    const totalLessons = course?.sections?.reduce(
      (acc: number, s: any) => acc + (s.lessons?.length || 0), 0
    ) || 0;

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden text-center">
          {/* Hero */}
          <div className="relative p-12 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="absolute w-20 h-20 border-2 border-white rounded-full" style={{
                  left: `${10 + i * 15}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }} />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrophy className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{content.message || 'Congratulations!'}</h1>
              <p className="text-white/90 text-lg">You've completed this course!</p>
            </div>
          </div>

          <div className="p-8">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="text-2xl font-bold text-orange-600">{totalLessons}</div>
                <div className="text-xs text-orange-700 font-medium">Lessons Done</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">+{totalLessons * 50}</div>
                <div className="text-xs text-green-700 font-medium">XP Earned</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="text-2xl font-bold text-blue-600">{formatSessionTime(sessionSeconds)}</div>
                <div className="text-xs text-blue-700 font-medium">Time Spent</div>
              </div>
            </div>

            {content.summary && (
              <div className="text-left max-w-md mx-auto mb-8">
                <h3 className="font-bold text-gray-800 mb-3">What you learned:</h3>
                <ul className="space-y-2">
                  {content.summary.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <FaCheck className="text-green-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.nextSteps && (
              <div className="text-left max-w-md mx-auto mb-8">
                <h3 className="font-bold text-gray-800 mb-3">Next Steps:</h3>
                <ul className="space-y-2">
                  {content.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="text-gray-600 flex items-start gap-2">
                      <span className="text-orange-500 font-bold mt-0.5">→</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievement badges */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100 mb-6">
              <p className="text-sm font-bold text-orange-800 mb-2 flex items-center justify-center gap-2">
                <FaTrophy className="text-yellow-500" /> Achievements Unlocked
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Course Graduate', 'Dedicated Learner'].map((badge) => (
                  <span key={badge} className="px-3 py-1 bg-white text-orange-700 text-xs font-semibold rounded-full border border-orange-200 shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => markLessonComplete()}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all transform hover:scale-105"
            >
              Complete Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--page-accent)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[var(--page-text-muted)] font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================
  
  if (showSkeleton) {
    return (
      <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
        {/* Desktop Sidebar Skeleton */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <SidebarSkeleton />
        </aside>
        
        {/* Mobile Top Bar Skeleton */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-md animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-hidden">
          <LessonContentSkeleton />
        </main>
        
        {/* Mobile Bottom Nav Skeleton */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-around">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-bg)' }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--page-text)] mb-4" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>Course not found</h2>
          <a href="/#/dashboard" className="text-[var(--page-accent)] hover:underline">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const progressPercent = calculateProgress();
  
  // Determine layout
  const showSidebar = !currentLesson || lessonType === 'concept' || lessonType === 'completion';
  const isFullWidthLesson = lessonType === 'mcq' || lessonType === 'codingTask' || 
                            lessonType === 'coding' || lessonType === 'moduleTest' || 
                            lessonType === 'test';

  /**
   * ========================================
   * SIDEBAR COMPONENT (Desktop: Fixed Left, Mobile: Drawer)
   * ========================================
   */
  const renderSidebar = () => (
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
  );

  /**
   * ========================================
   * MOBILE TOP NAV WITH HAMBURGER
   * ========================================
   */
  const renderMobileNav = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30">
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <HiOutlineMenu className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex-1 mx-3">
            <div className="text-sm font-semibold text-gray-900 truncate" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>
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
                className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigateLesson('next')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * ========================================
   * COURSE OVERVIEW (No Lesson Selected)
   * ========================================
   */
  const renderCourseOverview = () => {
    const milestone = getMilestoneBadge();
    return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-[var(--page-border)] shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
          <button
            onClick={() => window.location.hash = `/course/${courseId}`}
            className="mb-4 px-4 py-2 text-sm text-[var(--page-text-muted)] hover:text-[var(--page-text)] bg-white/60 hover:bg-white rounded-xl flex items-center gap-2 font-medium transition-all border border-[var(--page-border)]"
          >
            <FaChevronLeft className="w-3 h-3" /> Back to Course Details
          </button>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[var(--page-text)] mb-3" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>{course.title}</h1>
              <p className="text-[var(--page-text-muted)] leading-relaxed">
                {course.description || 'Welcome to this course. Select a lesson from the sidebar to begin learning.'}
              </p>
            </div>
            {milestone && (
              <div className={`${milestone.color} px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-bold animate-bounce`}>
                {milestone.icon}
                {milestone.label}
              </div>
            )}
          </div>

          {/* Session time in overview */}
          {sessionSeconds > 60 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--page-text-muted)]">
              <FaClock className="w-3.5 h-3.5 text-[var(--page-accent)]" />
              <span>This session: {formatSessionTime(sessionSeconds)}</span>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div className="p-8" style={{ background: 'var(--page-gradient)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[var(--page-text)]">Your Progress</span>
            <span className="text-2xl font-bold text-[var(--page-accent)]" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>{progressPercent}%</span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-[var(--page-text-muted)] mt-3">
            Keep going! You're {progressPercent >= 50 ? 'more than halfway' : 'making great progress'}.
          </p>
        </div>

        {/* Modules Overview */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[var(--page-text)] mb-6" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>Course Modules</h2>
          <div className="space-y-4">
            {course.sections.map((module: any, idx: number) => {
              const moduleProgress = module.lessons?.filter((l: any) => 
                isLessonCompleted(l._id)
              ).length || 0;
              const totalLessons = module.lessons?.length || 0;
              const progressPct = totalLessons > 0 ? (moduleProgress / totalLessons) * 100 : 0;

              return (
                <div key={idx} className="p-6 bg-[var(--page-section)]/50 rounded-2xl border border-[var(--page-border)] hover:border-[var(--page-accent)]/20 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[var(--page-accent)] uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        {progressPct === 100 && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-[var(--page-text)] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>{module.title}</h3>
                      <p className="text-sm text-[var(--page-text-muted)]">
                        {moduleProgress}/{totalLessons} lessons completed
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-[var(--page-border)] rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-[var(--page-accent)] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (module.lessons?.[0]) {
                        selectLesson(module.lessons[0], idx, 0);
                      }
                    }}
                    className="text-sm text-[var(--page-accent)] hover:text-[var(--page-accent)]/80 font-semibold flex items-center gap-2 group"
                  >
                    {progressPct === 0 ? 'Start Module' : 'Continue Learning'}
                    <FaChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 bg-[var(--page-section)] border-t border-[var(--page-border)] text-center">
          <button
            onClick={() => {
              if (course.sections?.[0]?.lessons?.[0]) {
                selectLesson(course.sections[0].lessons[0], 0, 0);
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-[var(--page-accent)] to-[var(--page-accent-secondary)] hover:from-[var(--page-accent)]/90 hover:to-[var(--page-accent-secondary)]/90 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
          </button>
        </div>
      </div>
    </div>
    );
  };

  /**
   * ========================================
   * MAIN RENDER
   * ========================================
   */
  return (
    <div className="min-h-screen font-['Inter',system-ui,sans-serif]" style={{ background: 'var(--page-bg)', backgroundImage: 'var(--page-gradient)', backgroundAttachment: 'fixed' }}>
      {/* Sidebar */}
      {showSidebar && renderSidebar()}

      {/* Focus Mode - Hide sidebar on desktop when active */}
      {isFocusMode && showSidebar && (
        <div className="hidden lg:block fixed top-0 left-0 w-80 h-screen bg-black/30 z-45 transition-opacity" style={{ zIndex: 45 }} />
      )}

      {/* Mobile Nav */}
      {renderMobileNav()}

      {/* Main Content */}
      <main className={`
        pt-16 lg:pt-8 min-h-screen
        ${showSidebar ? 'lg:ml-80' : ''}
      `}>
        <div className={`
          ${isFullWidthLesson ? 'max-w-7xl' : 'max-w-5xl'}
          mx-auto px-4 sm:px-6 lg:px-8 py-8
        `}>
          {/* Desktop Breadcrumb & Navigation */}
          {currentLesson && (
            <div className="hidden lg:flex items-center justify-between mb-6">
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
                <FaChevronRight className="w-3 h-3 text-[var(--page-text-muted)]/40" />
                <span className="text-[var(--page-text-muted)]">Module {currentModuleIndex + 1}</span>
                <FaChevronRight className="w-3 h-3 text-[var(--page-text-muted)]/40" />
                <span className="text-[var(--page-text)] font-semibold">Lesson {currentLessonIndex + 1}</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Session Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--page-section)] rounded-xl text-xs font-semibold text-[var(--page-text-muted)]" title="Session time">
                  <FaClock className="w-3 h-3 text-[var(--page-accent)]" />
                  <span>{formatSessionTime(sessionSeconds)}</span>
                </div>

                {/* Focus Mode Toggle */}
                <button
                  onClick={() => {
                    setIsFocusMode(prev => !prev);
                    toast.success(isFocusMode ? 'Focus mode off' : 'Focus mode on — distractions hidden');
                  }}
                  className={`p-2 rounded-xl transition-all ${isFocusMode ? 'bg-[var(--page-accent)] text-white shadow-lg shadow-[var(--page-accent)]/30' : 'bg-[var(--page-section)] text-[var(--page-text-muted)] hover:bg-[var(--page-border)]'}`}
                  title={isFocusMode ? 'Exit Focus Mode (F)' : 'Focus Mode (F)'}
                >
                  {isFocusMode ? <FaMoon className="w-4 h-4" /> : <FaSun className="w-4 h-4" />}
                </button>

                {/* Keyboard Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(prev => !prev)}
                  className="p-2 bg-[var(--page-section)] text-[var(--page-text-muted)] hover:bg-[var(--page-border)] rounded-xl transition-all"
                  title="Keyboard Shortcuts (?)"
                >
                  <FaKeyboard className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-[var(--page-border)]" />

                <button
                  onClick={() => navigateLesson('prev')}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="px-3.5 py-2 text-[var(--page-text-muted)] hover:text-[var(--page-text)] hover:bg-[var(--page-section)] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all font-medium text-sm flex items-center gap-1.5"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Prev
                </button>
                <button
                  onClick={() => navigateLesson('next')}
                  className="px-3.5 py-2 bg-[var(--page-accent)] hover:bg-[var(--page-accent)]/90 text-white rounded-xl transition-all font-medium text-sm flex items-center gap-1.5 shadow-sm"
                >
                  Next
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
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
            <div className="bg-white rounded-2xl border border-[var(--page-border)] shadow-[var(--shadow-sm)] overflow-hidden">
              {/* Lesson Header */}
              <div className="p-6 lg:p-8 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--page-accent)] to-[var(--page-accent-secondary)] flex items-center justify-center shadow-lg">
                    <span className="text-white">{getLessonIcon(currentLesson.description)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl lg:text-3xl font-bold text-[var(--page-text)] leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>
                        {currentLesson.title}
                      </h1>
                      {currentLesson.isPreview && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          FREE PREVIEW
                        </span>
                      )}
                    </div>
                    {currentLesson.description && (
                      <div className="text-[var(--page-text-muted)] leading-relaxed">
                        <RichTextRenderer content={currentLesson.description} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                {lessonType === 'concept' && renderConceptLesson()}
                {lessonType === 'mcq' && renderMCQLesson()}
                {(lessonType === 'coding' || lessonType === 'codingTask') && renderCodingLesson()}
                {(lessonType === 'test' || lessonType === 'moduleTest') && renderModuleTest()}
                {lessonType === 'completion' && renderCompletionScreen()}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation (when lesson active) */}
      {currentLesson && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-20">
          <button
            onClick={() => navigateLesson('prev')}
            disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FaChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={() => navigateLesson('next')}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Next
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Floating Panel */}
      {currentLesson && <AIFloatingPanel currentLesson={currentLesson} />}

      {/* Milestone Badge */}
      {milestone && (
        <MilestoneBadge
          type={milestone.type}
          duration={2500}
          onDismiss={() => setMilestone(null)}
        />
      )}

      {/* Focus Mode Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-black/5 transition-opacity" />
          {/* Subtle vignette effect */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)'
          }} />
        </div>
      )}

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[var(--page-border)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[var(--page-text)] flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>
                <FaKeyboard className="text-[var(--page-accent)]" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="p-1.5 hover:bg-[var(--page-section)] rounded-lg transition-colors">
                <FaTimes className="w-4 h-4 text-[var(--page-text-muted)]" />
              </button>
            </div>
            <div className="space-y-1.5">
              {[
                { keys: ['Alt', '←'], desc: 'Previous lesson' },
                { keys: ['Alt', '→'], desc: 'Next lesson' },
                { keys: ['F'], desc: 'Toggle focus mode' },
                { keys: ['S'], desc: 'Toggle sidebar' },
                { keys: ['Esc'], desc: 'Close panel / exit focus' },
                { keys: ['?'], desc: 'Toggle this panel' },
              ].map(({ keys, desc }) => (
                <div key={desc} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[var(--page-section)] transition-colors">
                  <span className="text-sm text-[var(--page-text)]">{desc}</span>
                  <div className="flex items-center gap-1">
                    {keys.map((k, i) => (
                      <kbd key={i} className="px-2.5 py-1 bg-[var(--page-section)] border border-[var(--page-border)] rounded-lg text-xs font-mono font-semibold text-[var(--page-text-muted)]">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-[var(--page-text-muted)]/60 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-[var(--page-section)] rounded text-[var(--page-text-muted)] font-mono">?</kbd> anytime to toggle this panel
            </p>
          </div>
        </div>
      )}

      {/* Milestone Badge Toast */}
      {!isFocusMode && (() => {
        const milestone = getMilestoneBadge();
        if (!milestone || progressPercent < 100) return null;
        return (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className={`${milestone.color} px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-lg font-bold`}>
              {milestone.icon}
              <span>{milestone.label}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default LearningPage;
