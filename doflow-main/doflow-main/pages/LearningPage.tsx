import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import ReactPlayer from 'react-player';
import { FaCheck, FaLock, FaPlay, FaDownload, FaChevronDown, FaChevronUp, FaTimes, FaCheckCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface LearningPageProps {
  courseId: string;
}

const LearningPage: React.FC<LearningPageProps> = ({ courseId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>({});
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/${courseId}`)
      ]);

      setCourse(courseRes.data);
      setProgress(progressRes.data);

      // Set first lesson as current
      if (courseRes.data.sections.length > 0 && courseRes.data.sections[0].lessons.length > 0) {
        selectLesson(courseRes.data.sections[0].lessons[0]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      toast.error('Failed to load course');
      setIsLoading(false);
    }
  };

  const selectLesson = async (lesson: any) => {
    setCurrentLesson(lesson);
    setSelectedAnswer(null);
    setShowAnswer(false);

    if (!lesson?.videoUrl) {
      toast.error('This lesson does not have a video yet.');
      setVideoUrl('');
      return;
    }

    const isExternalUrl = /^https?:\/\//i.test(lesson.videoUrl);

    if (isExternalUrl) {
      setVideoUrl(lesson.videoUrl);
      return;
    }

    try {
      const response = await api.get('/upload/signed-url', {
        params: { key: lesson.videoUrl }
      });
      setVideoUrl(response.data.url);
    } catch (error) {
      console.error('Failed to get video URL:', error);
      toast.error('Video is temporarily unavailable.');
      setVideoUrl(lesson.videoUrl);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await api.post('/progress', {
        courseId,
        lessonId: currentLesson._id,
        isCompleted: true
      });

      toast.success('Lesson marked as complete!');
      fetchCourseData(); // Refresh progress
    } catch (error) {
      console.error('Failed to mark lesson complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress.progress?.some((p: any) => p.lesson === lessonId && p.isCompleted);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <a href="/#/dashboard" className="btn-primary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          <div className="max-h-screen overflow-y-auto">
            {currentLesson && (
              <div>
                {/* Optional Video Player - Minimized for text courses */}
                {videoUrl && (
                  <div className="bg-black">
                    <div className="aspect-video bg-black max-h-[300px]">
                      <ReactPlayer
                        url={videoUrl}
                        width="100%"
                        height="100%"
                        controls
                        config={{
                          file: {
                            attributes: {
                              controlsList: 'nodownload'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Lesson Content - CodeChef Clean White Style */}
                <div className="bg-white p-8 border-t border-gray-200">
                  <h1 className="text-3xl font-bold text-black mb-6">{currentLesson.title}</h1>
                  
                  {/* Render Interactive Content */}
                  <div className="space-y-8">
                    {(() => {
                      const description = currentLesson.description;
                      
                      // Parse CodeChef-style content with sections separated by ---
                      const mainSections = description.split(/\n---\n/);
                      
                      return mainSections.map((section, sectionIndex) => {
                        // Check if this section contains an MCQ Checkpoint
                        if (section.includes('## MCQ Checkpoint')) {
                          // Parse new CodeChef-style MCQ with <details>
                          const questions = section.split(/\nQ\d+\./).filter(q => q.trim());
                          
                          return (
                            <div key={sectionIndex} className="my-8">
                              <h2 className="text-2xl font-bold text-black mb-6">MCQ Checkpoint</h2>
                              {questions.slice(1).map((q, qIndex) => {
                                const questionText = q.substring(0, q.indexOf('\n\nA.')).trim();
                                const optionsStart = q.indexOf('\nA.');
                                const detailsStart = q.indexOf('<details>');
                                const optionsText = q.substring(optionsStart, detailsStart).trim();
                                const answerMatch = q.match(/<summary>Correct Answer<\/summary>([\s\S]*?)<\/details>/);
                                const correctAnswer = answerMatch ? answerMatch[1].trim() : '';
                                
                                // Parse options
                                const optionLines = optionsText.split('\n').filter(l => l.trim());
                                const options = optionLines.map(opt => {
                                  const match = opt.match(/^([A-D])\.\s*(.*)/);
                                  return match ? { letter: match[1], text: match[2].trim() } : null;
                                }).filter(Boolean);
                                
                                return (
                                  <div key={qIndex} className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
                                    <p className="text-lg text-gray-800 mb-4 font-medium">Q{qIndex + 1}. {questionText}</p>
                                    
                                    <div className="space-y-2">
                                      {options.map((option: any) => {
                                        const isSelected = selectedAnswer === `${qIndex}-${option.letter}`;
                                        const isCorrect = correctAnswer.startsWith(option.letter);
                                        const showResult = showAnswer && selectedAnswer?.startsWith(`${qIndex}-`);
                                        
                                        return (
                                          <button
                                            key={option.letter}
                                            onClick={() => !showAnswer && setSelectedAnswer(`${qIndex}-${option.letter}`)}
                                            disabled={showAnswer}
                                            className={`w-full text-left p-3 rounded border transition-all ${
                                              showResult && isCorrect
                                                ? 'bg-green-50 border-green-500 text-green-900'
                                                : showResult && isSelected && !isCorrect
                                                ? 'bg-red-50 border-red-500 text-red-900'
                                                : isSelected
                                                ? 'bg-orange-50 border-orange-500 text-orange-900'
                                                : 'bg-white border-gray-300 text-gray-700 hover:border-orange-400'
                                            }`}
                                          >
                                            <span className="font-medium">{option.letter}.</span> {option.text}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    
                                    {!showAnswer && selectedAnswer?.startsWith(`${qIndex}-`) && (
                                      <button
                                        onClick={() => setShowAnswer(true)}
                                        className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded transition-colors"
                                      >
                                        Check Answer
                                      </button>
                                    )}
                                    
                                    {showAnswer && selectedAnswer?.startsWith(`${qIndex}-`) && (
                                      <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded">
                                        <p className="text-sm text-gray-800"><strong>Answer:</strong> {correctAnswer}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        
                        // Check for Coding Task
                        if (section.includes('## Coding Task')) {
                          return (
                            <div key={sectionIndex} className="my-8 bg-white border border-gray-300 rounded-lg p-6">
                              <h2 className="text-2xl font-bold text-black mb-4">Coding Task</h2>
                              {(() => {
                                let inCodeBlock = false;
                                let codeContent: string[] = [];
                                const elements: JSX.Element[] = [];
                                
                                section.split('\n').forEach((line: string, lineIndex: number) => {
                                  if (line.startsWith('```')) {
                                    if (inCodeBlock) {
                                      elements.push(
                                        <div key={`code-${sectionIndex}-${lineIndex}`} className="bg-gray-100 border border-gray-300 rounded p-4 my-3">
                                          <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                                            <code>{codeContent.join('\n')}</code>
                                          </pre>
                                        </div>
                                      );
                                      codeContent = [];
                                      inCodeBlock = false;
                                    } else {
                                      inCodeBlock = true;
                                    }
                                    return;
                                  }
                                  
                                  if (inCodeBlock) {
                                    codeContent.push(line);
                                    return;
                                  }
                                  
                                  if (line.startsWith('## ')) {
                                    return; // Skip the heading as we already rendered it
                                  }
                                  
                                  if (line.trim() && !line.startsWith('##')) {
                                    elements.push(
                                      <p key={`p-${sectionIndex}-${lineIndex}`} className="text-gray-700 mb-2 leading-relaxed">
                                        {line}
                                      </p>
                                    );
                                  }
                                });
                                
                                return <div>{elements}</div>;
                              })()}
                            </div>
                          );
                        }
                        
                        // Regular content rendering with clean CodeChef style
                        return (
                          <div key={sectionIndex} className="my-6">
                            {(() => {
                              let inCodeBlock = false;
                              let codeContent: string[] = [];
                              const elements: JSX.Element[] = [];
                              
                              section.split('\n').forEach((line: string, lineIndex: number) => {
                                // Handle code blocks
                                if (line.startsWith('```')) {
                                  if (inCodeBlock) {
                                    // End code block - CodeChef style
                                    elements.push(
                                      <div key={`code-${sectionIndex}-${lineIndex}`} className="bg-gray-100 border border-gray-300 rounded p-4 my-4">
                                        <pre className="text-sm text-gray-800 overflow-x-auto font-mono">
                                          <code>{codeContent.join('\n')}</code>
                                        </pre>
                                      </div>
                                    );
                                    codeContent = [];
                                    inCodeBlock = false;
                                  } else {
                                    // Start code block
                                    inCodeBlock = true;
                                  }
                                  return;
                                }
                                
                                if (inCodeBlock) {
                                  codeContent.push(line);
                                  return;
                                }
                                
                                // Handle markdown headers
                                if (line.startsWith('## ')) {
                                  const text = line.substring(3).trim();
                                  elements.push(
                                    <h2 key={`h2-${sectionIndex}-${lineIndex}`} className="text-2xl font-bold text-black mt-8 mb-4">
                                      {text}
                                    </h2>
                                  );
                                  return;
                                }
                                
                                // Handle subheadings (###)
                                if (line.startsWith('### ')) {
                                  const text = line.substring(4).trim();
                                  elements.push(
                                    <h3 key={`h3-${sectionIndex}-${lineIndex}`} className="text-lg font-bold text-gray-800 mt-6 mb-3">
                                      {text}
                                    </h3>
                                  );
                                  return;
                                }
                                
                                // Handle bullet points
                                if (line.trim().startsWith('-')) {
                                  const text = line.trim().substring(1).trim();
                                  elements.push(
                                    <li key={`li-${sectionIndex}-${lineIndex}`} className="text-gray-700 ml-6 mb-2 list-disc">
                                      {text.split('**').map((part, i) => 
                                        i % 2 === 0 ? part : <strong key={i} className="text-black font-semibold">{part}</strong>
                                      )}
                                    </li>
                                  );
                                  return;
                                }
                                
                                // Handle inline code and regular text
                                if (line.trim()) {
                                  // Handle inline code with backticks
                                  const parts = line.split('`');
                                  const content = parts.map((part, i) => 
                                    i % 2 === 0 
                                      ? part.split('**').map((p, j) => j % 2 === 0 ? p : <strong key={j} className="text-black font-semibold">{p}</strong>)
                                      : <code key={i} className="bg-gray-200 text-gray-900 px-2 py-1 rounded font-mono text-sm">{part}</code>
                                  );
                                  
                                  elements.push(
                                    <p key={`p-${sectionIndex}-${lineIndex}`} className="text-gray-700 mb-3 leading-relaxed text-base">
                                      {content}
                                    </p>
                                  );
                                }
                              });
                              
                              return <div>{elements}</div>;
                            })()}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-800">
                    <button
                      onClick={markLessonComplete}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
                    >
                      <FaCheck className="mr-2" />
                      Mark as Complete
                    </button>

                    {currentLesson.resources && currentLesson.resources.length > 0 && (
                      <div className="flex gap-2">
                        {currentLesson.resources.map((resource: any, index: number) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200"
                          >
                            <FaDownload className="mr-2" />
                            {resource.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Content Sidebar */}
        <div className="w-full lg:w-[400px] bg-gray-900 border-l border-gray-800 overflow-y-auto" style={{ maxHeight: '100vh' }}>
          {/* Course Header */}
          <div className="p-5 border-b border-gray-700 bg-gray-850">
            <h2 className="text-lg font-bold text-white mb-3">{course.title}</h2>
            <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
              <span className="font-medium">{progress.enrollment?.progress || 0}% Complete</span>
              <span>{progress.enrollment?.completedLessons?.length || 0} / {course.totalLessons} Lessons</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress.enrollment?.progress || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Sections List */}
          <div className="p-4 space-y-3">
            {course.sections.map((section: any, sectionIndex: number) => (
              <div key={sectionIndex} className="rounded-xl overflow-hidden bg-gray-800/50">
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white text-sm font-bold rounded-lg">
                      {sectionIndex + 1}
                    </span>
                    <span className="font-semibold text-white text-left">{section.title}</span>
                  </div>
                  {expandedSections.has(sectionIndex) ? (
                    <FaChevronUp className="text-gray-400" />
                  ) : (
                    <FaChevronDown className="text-gray-400" />
                  )}
                </button>

                {/* Lessons List */}
                {expandedSections.has(sectionIndex) && (
                  <div className="p-2 space-y-1 bg-gray-850">
                    {section.lessons.map((lesson: any) => {
                      const isCompleted = isLessonCompleted(lesson._id);
                      const isCurrent = currentLesson?._id === lesson._id;

                      return (
                        <button
                          key={lesson._id}
                          onClick={() => selectLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                            isCurrent
                              ? 'bg-purple-600/30 border-l-4 border-purple-500'
                              : 'hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                                  <FaCheck className="text-white text-xs" />
                                </div>
                              ) : isCurrent ? (
                                <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                                  <FaPlay className="text-white text-xs" />
                                </div>
                              ) : lesson.isPreview ? (
                                <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                                  <FaPlay className="text-gray-300 text-xs" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                                  <FaLock className="text-gray-500 text-xs" />
                                </div>
                              )}
                            </div>
                            
                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm truncate ${
                                isCurrent ? 'text-purple-300' : 'text-gray-200'
                              }`}>
                                {lesson.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {lesson.duration} min
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;
