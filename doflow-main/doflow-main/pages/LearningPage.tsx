import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import Editor from '@monaco-editor/react';
import { FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCheck, FaPlay, FaBook, FaCode, FaQuestionCircle, FaLaptopCode, FaLightbulb, FaClipboardList } from 'react-icons/fa';
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

const LearningPage: React.FC<LearningPageProps> = ({ courseId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [progress, setProgress] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  
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
  
  // UI State for concept lessons
  const [copiedCode, setCopiedCode] = useState(false);

  // Detect programming language from course tags (must be before any early returns)
  const programmingLanguage = React.useMemo(() => {
    const tags = course?.tags || [];
    if (tags.some((tag: string) => tag.toLowerCase() === 'java')) return 'Java';
    if (tags.some((tag: string) => tag.toLowerCase() === 'python')) return 'Python';
    if (tags.some((tag: string) => tag.toLowerCase() === 'javascript')) return 'JavaScript';
    if (tags.some((tag: string) => tag.toLowerCase() === 'c++')) return 'C++';
    return 'Python'; // Default
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

  // Parse lesson content from resources
  const getLessonContent = (lesson: any): LessonContent | null => {
    if (!lesson?.resources?.[0]?.url) return null;
    try {
      return JSON.parse(lesson.resources[0].url);
    } catch {
      return null;
    }
  };

  // Get lesson type from parsed content or title
  const getLessonType = (lesson: any): string => {
    const content = getLessonContent(lesson);
    if (content?.type) return content.type;
    
    const title = lesson?.title?.toLowerCase() || '';
    if (title.includes('mcq') || title.includes('quiz')) return 'mcq';
    if (title.includes('coding task') || title.includes('challenge')) return 'codingTask';
    if (title.includes('test')) return 'moduleTest';
    if (title.includes('congratulations')) return 'completion';
    return 'concept';
  };

  const selectLesson = (lesson: any, moduleIndex: number, lessonIndex: number) => {
    setCurrentLesson(lesson);
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    // Reset states
    setSelectedAnswer(null);
    setMcqSubmitted(false);
    setMcqCorrect(null);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestScore(0);
    
    // Set starter code if coding task
    const content = getLessonContent(lesson);
    if (content?.type === 'codingTask' && content.content?.starterCode) {
      setCode(content.content.starterCode);
    } else {
      const defaultComment = programmingLanguage === 'Java' ? '// Write your Java code here\n' : '# Write your Python code here\n';
      setCode(defaultComment);
    }
    setOutput('');
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!course) return;
    
    // If no lesson selected, start from first
    if (currentModuleIndex === -1 || currentLessonIndex === -1) {
      if (direction === 'next' && course.sections?.[0]?.lessons?.[0]) {
        selectLesson(course.sections[0].lessons[0], 0, 0);
      }
      return;
    }
    
    let newModuleIndex = currentModuleIndex;
    let newLessonIndex = currentLessonIndex;
    
    if (direction === 'next') {
      if (currentLessonIndex < course.sections[currentModuleIndex].lessons.length - 1) {
        newLessonIndex++;
      } else if (currentModuleIndex < course.sections.length - 1) {
        newModuleIndex++;
        newLessonIndex = 0;
        setExpandedModules(prev => new Set([...prev, newModuleIndex]));
      } else {
        return;
      }
    } else {
      if (currentLessonIndex > 0) {
        newLessonIndex--;
      } else if (currentModuleIndex > 0) {
        newModuleIndex--;
        newLessonIndex = course.sections[newModuleIndex].lessons.length - 1;
        setExpandedModules(prev => new Set([...prev, newModuleIndex]));
      } else {
        return;
      }
    }
    
    const lesson = course.sections[newModuleIndex].lessons[newLessonIndex];
    selectLesson(lesson, newModuleIndex, newLessonIndex);
  };

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.progress?.some((p: any) => p.lesson === lessonId && p.isCompleted);
  };

  const markLessonComplete = async (silent = false) => {
    if (!currentLesson) return;
    try {
      await api.post('/progress', {
        courseId,
        lessonId: currentLesson._id,
        isCompleted: true
      });
      
      // Update local state immediately with a new object to trigger re-render
      setProgress((prevProgress) => {
        const newProgress = { ...prevProgress };
        if (newProgress.progress) {
          const existingIndex = newProgress.progress.findIndex((p: any) => p.lessonId === currentLesson._id);
          if (existingIndex !== -1) {
            newProgress.progress[existingIndex] = {
              ...newProgress.progress[existingIndex],
              isCompleted: true,
              completedAt: new Date()
            };
          } else {
            newProgress.progress = [
              ...newProgress.progress,
              {
                lessonId: currentLesson._id,
                isCompleted: true,
                completedAt: new Date()
              }
            ];
          }
        } else {
          newProgress.progress = [
            {
              lessonId: currentLesson._id,
              isCompleted: true,
              completedAt: new Date()
            }
          ];
        }
        return newProgress;
      });
      
      if (!silent) {
        toast.success('Lesson completed!');
        // Optionally refetch to ensure everything is in sync
        fetchCourseData();
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('Failed to mark lesson complete');
    }
  };

  // Get lesson icon based on type
  const getLessonIcon = (lesson: any) => {
    const type = getLessonType(lesson);
    switch (type) {
      case 'mcq': return <FaQuestionCircle className="text-blue-500" />;
      case 'codingTask': return <FaLaptopCode className="text-green-500" />;
      case 'moduleTest': return <FaClipboardList className="text-purple-500" />;
      case 'completion': return <FaCheck className="text-green-500" />;
      default: return <FaBook className="text-orange-500" />;
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!course || !progress.progress) return 0;
    let total = 0;
    let completed = 0;
    course.sections.forEach((section: any) => {
      section.lessons.forEach((lesson: any) => {
        total++;
        if (isLessonCompleted(lesson._id)) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Handle MCQ submit
  const handleMCQSubmit = () => {
    if (!selectedAnswer) return;
    const content = getLessonContent(currentLesson);
    const correct = selectedAnswer === content?.content?.correctAnswer;
    setMcqSubmitted(true);
    setMcqCorrect(correct);
    if (correct) markLessonComplete(true); // Silent completion for MCQ
  };

  // Handle Module Test submit
  const handleTestSubmit = () => {
    const content = getLessonContent(currentLesson);
    const questions = content?.content?.questions || [];
    let correct = 0;
    questions.forEach((q: any) => {
      if (testAnswers[q.id] === q.correctAnswer) correct++;
    });
    setTestScore(correct);
    setTestSubmitted(true);
    if (correct === questions.length) markLessonComplete(true); // Silent completion for module test
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
          // Runtime error or stderr output
          setOutput(`Error:\n${result.error}`);
        } else if (result.output) {
          // Successful execution with output
          setOutput(result.output);
        } else {
          // Successful execution but no output
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
        markLessonComplete(true); // Silent completion to prevent redirect
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
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
  
  // Hide sidebar for MCQ, Coding, and Module Test lessons
  const showSidebar = !currentLesson || lessonType === 'concept' || lessonType === 'completion';
  const isFullWidthLesson = lessonType === 'mcq' || lessonType === 'codingTask' || lessonType === 'coding' || lessonType === 'moduleTest' || lessonType === 'test';
  
  // Debug logging
  console.log('Current Lesson:', currentLesson?.title, 'Type:', lessonType, 'Content:', lessonContent);

  // ============================================
  // RENDER: CONCEPT LESSON (ULTRA EDITION - Enhanced)
  // ============================================
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
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">{content.explanation || currentLesson?.description}</p>
            </div>
          </div>
          
          {/* Real-World Analogy - Enhanced */}
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
          
          {/* Syntax / Code Example - Interactive */}
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
          
          {/* Key Notes - Card Style */}
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

          {/* Navigation Footer - Enhanced */}
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

  // ============================================
  // RENDER: MCQ LESSON (CodeChef Style - ULTRA)
  // ============================================
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
                // Handle both formats: "A) Text" or plain "Text"
                const hasLetterPrefix = /^[A-D]\)/.test(option);
                const optionLetter = hasLetterPrefix ? option.charAt(0) : String.fromCharCode(65 + index); // A, B, C, D
                const optionText = hasLetterPrefix ? option.substring(3).trim() : option.trim();
                const isSelected = selectedAnswer === optionLetter;
                
                // Handle both formats: letter ("A") or index (0)
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

  // ============================================
  // RENDER: CODING TASK (ULTRA EDITION)
  // ============================================
  const renderCodingLesson = () => {
    const content = lessonContent?.content || {};
    // Handle different field names (problemStatement vs description, problemTitle vs problem)
    const problemTitle = content.problemTitle || content.problem || currentLesson?.title;
    const problemStatement = content.problemStatement || content.description || '';

    return (
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* LEFT: Problem */}
        <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{problemTitle}</h1>
            
            {/* Problem Statement */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Problem Statement</h2>
              <div className="p-3 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{problemStatement}</p>
              </div>
            </div>

            {/* Input/Output Format */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {content.inputFormat && (
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <h3 className="text-xs font-semibold text-blue-600 uppercase mb-2">Input Format</h3>
                  <pre className="text-xs sm:text-sm text-blue-800 font-mono whitespace-pre-wrap break-all">{content.inputFormat}</pre>
                </div>
              )}
              {content.outputFormat && (
                <div className="p-3 sm:p-4 bg-green-50 border border-green-100 rounded-xl">
                  <h3 className="text-xs font-semibold text-green-600 uppercase mb-2">Output Format</h3>
                  <pre className="text-xs sm:text-sm text-green-800 font-mono whitespace-pre-wrap break-all">{content.outputFormat}</pre>
                </div>
              )}
            </div>

            {/* Sample I/O */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 bg-gray-900 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Sample Input</h3>
                <pre className="text-xs sm:text-sm text-green-400 font-mono break-all">{content.sampleInput || 'N/A'}</pre>
              </div>
              <div className="p-3 sm:p-4 bg-gray-900 rounded-xl">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Sample Output</h3>
                <pre className="text-xs sm:text-sm text-green-400 font-mono break-all">{content.sampleOutput || 'N/A'}</pre>
              </div>
            </div>

            {/* Constraints */}
            {content.constraints && (
              <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <h3 className="text-xs font-semibold text-amber-600 uppercase mb-2">Constraints</h3>
                {Array.isArray(content.constraints) ? (
                  <ul className="text-xs sm:text-sm text-amber-800 space-y-1">
                    {content.constraints.map((c: string, i: number) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs sm:text-sm text-amber-800">{content.constraints}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Code Editor */}
        <div className="w-full lg:w-3/5 flex flex-col bg-gray-900 min-h-[400px] lg:min-h-0">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border-b border-gray-700">
            <span className="text-xs sm:text-sm text-gray-300 font-medium">{programmingLanguage}</span>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors"
              >
                <FaPlay className="text-xs" /> <span className="hidden sm:inline">Run</span>
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={isRunning}
                className="px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px] sm:min-h-[400px] lg:min-h-0">
            <Editor
              height="100%"
              defaultLanguage={programmingLanguage.toLowerCase()}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Output */}
          <div className="h-48 sm:h-40 lg:h-36 border-t border-gray-700 bg-gray-950">
            <div className="px-3 sm:px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs sm:text-sm text-gray-400">Output</span>
            </div>
            <div className="p-3 sm:p-4 h-full overflow-y-auto">
              <pre className="text-xs sm:text-sm text-gray-300 font-mono whitespace-pre-wrap break-all">{output || 'Click "Run" to execute your code or "Submit" to test against all test cases.'}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: MODULE TEST (ULTRA EDITION)
  // ============================================
  const renderModuleTest = () => {
    const content = lessonContent?.content || {};
    const questions = content.questions || [];

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-xl">
                <FaClipboardList className="text-purple-600 text-xl sm:text-2xl" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{content.testTitle || currentLesson?.title}</h1>
                <p className="text-sm sm:text-base text-gray-600">Answer all {questions.length} questions to complete this test</p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
            {questions.map((q: any, qIndex: number) => (
              <div key={q.id} className="p-4 sm:p-5 lg:p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
                  <span className="text-purple-600">Q{qIndex + 1}.</span> {q.question}
                </h3>
                <div className="space-y-2">
                  {q.options.map((option: string, oIndex: number) => {
                    const optionLetter = option.charAt(0);
                    const optionText = option.substring(3).trim();
                    const isSelected = testAnswers[q.id] === optionLetter;
                    const isCorrect = optionLetter === q.correctAnswer;

                    let styles = 'border-gray-200 bg-white hover:border-purple-300';
                    if (testSubmitted) {
                      if (isCorrect) styles = 'border-green-500 bg-green-50';
                      else if (isSelected && !isCorrect) styles = 'border-red-500 bg-red-50';
                    } else if (isSelected) {
                      styles = 'border-purple-500 bg-purple-50';
                    }

                    return (
                      <button
                        key={oIndex}
                        onClick={() => !testSubmitted && setTestAnswers(prev => ({ ...prev, [q.id]: optionLetter }))}
                        disabled={testSubmitted}
                        className={`w-full text-left p-2.5 sm:p-3 rounded-lg border-2 transition-all ${styles}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300 text-gray-500'}`}>
                            {optionLetter}
                          </span>
                          <span className="text-gray-700 text-sm sm:text-base break-words">{optionText}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {testSubmitted && (
                  <div className={`mt-3 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm break-words ${testAnswers[q.id] === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {testAnswers[q.id] === q.correctAnswer ? '✅ Correct!' : `❌ Incorrect. ${q.explanation}`}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Results / Submit */}
          <div className="p-4 sm:p-5 lg:p-6 bg-gray-50 border-t border-gray-200">
            {testSubmitted ? (
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold mb-2 ${testScore === questions.length ? 'text-green-600' : 'text-orange-600'}`}>
                  {testScore} / {questions.length}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  {testScore === questions.length ? '🎉 Perfect Score! You mastered this module!' : 'Keep practicing to improve your score!'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => { setTestAnswers({}); setTestSubmitted(false); setTestScore(0); }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Retry Test
                  </button>
                  <button
                    onClick={() => navigateLesson('next')}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleTestSubmit}
                  disabled={Object.keys(testAnswers).length < questions.length}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${Object.keys(testAnswers).length === questions.length ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Submit Test ({Object.keys(testAnswers).length}/{questions.length} answered)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: COMPLETION (Congratulations)
  // ============================================
  const renderCompletion = () => {
    const content = lessonContent?.content || {};

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center">
          <div className="p-12 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.message || 'Congratulations!'}</h1>
            <p className="text-gray-600 mb-8">You've completed this course!</p>
            
            {content.summary && (
              <div className="text-left max-w-md mx-auto mb-8">
                <h3 className="font-semibold text-gray-800 mb-3">What you learned:</h3>
                <ul className="space-y-2">
                  {content.summary.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <FaCheck className="text-green-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.nextSteps && (
              <div className="text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-800 mb-3">Next Steps:</h3>
                <ul className="space-y-2">
                  {content.nextSteps.map((step: string, i: number) => (
                    <li key={i} className="text-gray-600">→ {step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => markLessonComplete()}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Complete Course
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER: Course Overview (No lesson selected)
  // ============================================
  const renderCourseOverview = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {/* Back to Course Overview Button */}
        <button
          onClick={() => window.location.hash = `/course/${courseId}`}
          className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <FaChevronLeft className="text-xs" /> Back to Course Overview
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{course.title}</h1>
        <p className="text-gray-600 mb-6">{course.description || 'Welcome to this course. Select a lesson from the sidebar to begin learning.'}</p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Course Progress</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Course Content</h2>
          <div className="space-y-3">
            {course.sections.map((module: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-medium">{i + 1}</span>
                  <span className="font-medium text-gray-800">{module.title}</span>
                </div>
                <span className="text-sm text-gray-500">{module.lessons?.length || 0} lessons</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              if (course.sections?.[0]?.lessons?.[0]) {
                selectLesson(course.sections[0].lessons[0], 0, 0);
              }
            }}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        
        {/* LEFT SIDEBAR: Module & Lesson List - Only show for concept lessons or overview */}
        {showSidebar && (
        <div className="hidden lg:block w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto fixed left-0 top-0 pt-16">
          {/* Course Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 text-sm truncate">{course.title}</h2>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Module List */}
          <div className="p-2">
            {course.sections.map((module: any, moduleIndex: number) => (
              <div key={moduleIndex} className="mb-2">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(moduleIndex)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded text-xs font-medium flex items-center justify-center">
                      {moduleIndex + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 text-left">{module.title}</span>
                  </div>
                  {expandedModules.has(moduleIndex) ? (
                    <FaChevronUp className="text-gray-400 text-xs" />
                  ) : (
                    <FaChevronDown className="text-gray-400 text-xs" />
                  )}
                </button>

                {/* Lesson List */}
                {expandedModules.has(moduleIndex) && (
                  <div className="mt-1 ml-4 border-l-2 border-gray-200 pl-2">
                    {module.lessons.map((lesson: any, lessonIndex: number) => {
                      const isActive = currentModuleIndex === moduleIndex && currentLessonIndex === lessonIndex;
                      const completed = isLessonCompleted(lesson._id);

                      return (
                        <button
                          key={lesson._id}
                          onClick={() => selectLesson(lesson, moduleIndex, lessonIndex)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-orange-50 border-l-2 border-orange-500 -ml-[2px]' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Completion / Icon */}
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completed ? 'bg-green-500' : 'bg-gray-100'
                          }`}>
                            {completed ? (
                              <FaCheck className="text-white text-xs" />
                            ) : (
                              getLessonIcon(lesson.description)
                            )}
                          </div>
                          
                          <span className={`text-sm truncate ${isActive ? 'text-orange-600 font-medium' : 'text-gray-700'}`}>
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className={`flex-1 p-4 md:p-6 pt-20 md:pt-24 ${showSidebar ? 'lg:ml-80' : ''}`}>
          {/* Top Nav - Only show when lesson is selected */}
          {currentLesson && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                {/* Back to course overview button - always show */}
                <button
                  onClick={() => {
                    setCurrentLesson(null);
                    setCurrentModuleIndex(-1);
                    setCurrentLessonIndex(-1);
                  }}
                  className="mr-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <FaChevronLeft className="text-xs" /> <span className="hidden sm:inline">Back to Overview</span><span className="sm:hidden">Back</span>
                </button>
                <span>Module {currentModuleIndex + 1}</span>
                <span>/</span>
                <span>Lesson {currentLessonIndex + 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateLesson('prev')}
                  disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded hover:bg-gray-200"
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => navigateLesson('next')}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-200"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          {!currentLesson ? (
            renderCourseOverview()
          ) : (
            <>
              {lessonType === 'concept' && renderConceptLesson()}
              {lessonType === 'mcq' && renderMCQLesson()}
              {(lessonType === 'coding' || lessonType === 'codingTask') && renderCodingLesson()}
              {(lessonType === 'test' || lessonType === 'moduleTest') && renderModuleTest()}
              {lessonType === 'completion' && renderCompletion()}
            </>
          )}
        </div>

      </div>

      {/* AI Tutor - Floating Button */}
      <AITutor defaultTopic={currentLesson?.title || ''} />
    </div>
  );
};

export default LearningPage;
