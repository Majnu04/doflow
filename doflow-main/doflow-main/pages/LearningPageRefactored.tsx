import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import Editor from '@monaco-editor/react';
import { 
  FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCheck, 
  FaPlay, FaBook, FaCode, FaQuestionCircle, FaLaptopCode, FaLightbulb, 
  FaClipboardList, FaBars, FaTimes 
} from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { executeCode } from '../services/codeExecutionService';
import AITutor from '../src/components/AITutor';

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
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(-1);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(-1);
  const [progress, setProgress] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  
  // MCQ State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqCorrect, setMcqCorrect] = useState<boolean | null>(null);
  
  // Module Test State
  const [testAnswers, setTestAnswers] = useState<{[key: string]: string}>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // Coding State
  const [code, setCode] = useState('# Write your Python code here\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  
  // UI State
  const [copiedCode, setCopiedCode] = useState(false);

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

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`).catch(() => ({ data: {} }))
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);
      setCurrentLesson(null);
      setCurrentModuleIndex(-1);
      setCurrentLessonIndex(-1);
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
      await api.post(`/progress/${courseId}/lesson`, {
        lessonId: currentLesson._id
      });
      toast.success('Lesson marked complete!');
      await fetchCourseData();
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course not found</h2>
          <a href="/#/dashboard" className="text-orange-500 hover:underline">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const lessonType = currentLesson ? getLessonType(currentLesson) : null;
  const lessonContent = currentLesson ? getLessonContent(currentLesson) : null;
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
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-out
          w-80 overflow-hidden flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => window.location.hash = `/course/${courseId}`}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
            >
              <FaChevronLeft className="w-3 h-3" />
              Course Overview
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <h2 className="font-bold text-gray-900 text-base leading-tight mb-3 line-clamp-2">
            {course.title}
          </h2>
          
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span className="font-medium">Course Progress</span>
              <span className="font-semibold">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {course.sections.map((module: any, moduleIndex: number) => {
              const isExpanded = expandedModules.has(moduleIndex);
              const moduleProgress = module.lessons?.filter((l: any) => 
                isLessonCompleted(l._id)
              ).length || 0;
              const totalLessons = module.lessons?.length || 0;

              return (
                <div key={module._id || moduleIndex} className="rounded-xl overflow-hidden">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors text-left border border-gray-200 rounded-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                          Module {moduleIndex + 1}
                        </span>
                        {moduleProgress === totalLessons && totalLessons > 0 && (
                          <FaCheck className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
                        {module.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {moduleProgress}/{totalLessons} lessons
                      </p>
                    </div>
                    <div className="ml-3">
                      {isExpanded ? (
                        <FaChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FaChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {module.lessons?.map((lesson: any, lessonIndex: number) => {
                        const isActive = currentModuleIndex === moduleIndex && 
                                        currentLessonIndex === lessonIndex;
                        const isCompleted = isLessonCompleted(lesson._id);

                        return (
                          <button
                            key={lesson._id || lessonIndex}
                            onClick={() => selectLesson(lesson, moduleIndex, lessonIndex)}
                            className={`
                              w-full px-4 py-3 flex items-center gap-3 text-left rounded-lg
                              transition-all duration-200 group
                              ${isActive 
                                ? 'bg-orange-50 border-l-4 border-orange-500 pl-3' 
                                : 'hover:bg-gray-50 border-l-4 border-transparent pl-3'
                              }
                            `}
                          >
                            {/* Icon */}
                            <div className={`
                              flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                              ${isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : isActive
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
                              }
                            `}>
                              {isCompleted ? (
                                <FaCheck className="w-4 h-4" />
                              ) : (
                                getLessonIcon(lesson.description)
                              )}
                            </div>
                            
                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <p className={`
                                text-sm font-medium leading-tight line-clamp-2
                                ${isActive ? 'text-orange-600' : 'text-gray-700'}
                              `}>
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {lesson.duration} min
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );

  /**
   * ========================================
   * MOBILE TOP NAV WITH HAMBURGER
   * ========================================
   */
  const renderMobileNav = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <HiOutlineMenu className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="flex-1 mx-4">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {currentLesson ? currentLesson.title : course.title}
          </div>
          {currentLesson && (
            <div className="text-xs text-gray-500">
              Module {currentModuleIndex + 1} · Lesson {currentLessonIndex + 1}
            </div>
          )}
        </div>

        {currentLesson && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateLesson('prev')}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateLesson('next')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /**
   * ========================================
   * COURSE OVERVIEW (No Lesson Selected)
   * ========================================
   */
  const renderCourseOverview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-100">
          <button
            onClick={() => window.location.hash = `/course/${courseId}`}
            className="mb-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            <FaChevronLeft className="w-3 h-3" /> Back to Course Details
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 leading-relaxed">
            {course.description || 'Welcome to this course. Select a lesson from the sidebar to begin learning.'}
          </p>
        </div>

        {/* Progress Section */}
        <div className="p-8 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Your Progress</span>
            <span className="text-2xl font-bold text-orange-600">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Keep going! You're {progressPercent >= 50 ? 'more than halfway' : 'making great progress'}.
          </p>
        </div>

        {/* Modules Overview */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Modules</h2>
          <div className="space-y-4">
            {course.sections.map((module: any, idx: number) => {
              const moduleProgress = module.lessons?.filter((l: any) => 
                isLessonCompleted(l._id)
              ).length || 0;
              const totalLessons = module.lessons?.length || 0;
              const progressPct = totalLessons > 0 ? (moduleProgress / totalLessons) * 100 : 0;

              return (
                <div key={idx} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        {progressPct === 100 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                      <p className="text-sm text-gray-600">
                        {moduleProgress}/{totalLessons} lessons completed
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (module.lessons?.[0]) {
                        selectLesson(module.lessons[0], idx, 0);
                      }
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2 group"
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
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <button
            onClick={() => {
              if (course.sections?.[0]?.lessons?.[0]) {
                selectLesson(course.sections[0].lessons[0], 0, 0);
              }
            }}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            {progressPercent > 0 ? 'Continue Learning' : 'Start Learning'}
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * ========================================
   * MAIN RENDER
   * ========================================
   */
  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',system-ui,sans-serif]">
      {/* Sidebar */}
      {showSidebar && renderSidebar()}

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
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={() => {
                    setCurrentLesson(null);
                    setCurrentModuleIndex(-1);
                    setCurrentLessonIndex(-1);
                  }}
                  className="hover:text-gray-700 font-medium transition-colors"
                >
                  Course Overview
                </button>
                <FaChevronRight className="w-3 h-3" />
                <span>Module {currentModuleIndex + 1}</span>
                <FaChevronRight className="w-3 h-3" />
                <span className="text-gray-900 font-medium">Lesson {currentLessonIndex + 1}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateLesson('prev')}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all font-medium text-sm flex items-center gap-2"
                >
                  <FaChevronLeft className="w-3 h-3" />
                  Previous
                </button>
                <button
                  onClick={() => navigateLesson('next')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all font-medium text-sm flex items-center gap-2"
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
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Lesson Header */}
              <div className="p-6 lg:p-8 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    {getLessonIcon(currentLesson.description)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && (
                      <p className="text-gray-600 leading-relaxed">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="p-6 lg:p-8">
                <p className="text-gray-500 text-center py-12">
                  Lesson content rendering logic goes here...
                  <br />
                  <span className="text-sm">(Implement specific lesson types: concept, MCQ, coding, etc.)</span>
                </p>
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

      {/* AI Tutor */}
      <AITutor defaultTopic={currentLesson?.title || ''} />
    </div>
  );
};

export default LearningPage;
