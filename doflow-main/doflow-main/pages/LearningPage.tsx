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
    <div className="min-h-screen bg-gray-950">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 bg-gray-950">
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

                {/* Lesson Content */}
                <div className="bg-gray-900 p-8 border-t border-gray-800">
                  <h1 className="text-3xl font-bold text-white mb-6">{currentLesson.title}</h1>
                  
                  {/* Render Interactive Content */}
                  <div className="space-y-8">
                    {(() => {
                      const description = currentLesson.description;
                      const sections = description.split('\n\n');
                      
                      // Check if this is an MCQ lesson
                      const isMCQ = description.includes('**QUESTION:**');
                      
                      if (isMCQ) {
                        // Parse MCQ content
                        const questionMatch = description.match(/\*\*QUESTION:\*\*\s*([\s\S]*?)(?=A\))/);
                        const optionsMatch = description.match(/(A\)[\s\S]*?B\)[\s\S]*?C\)[\s\S]*?D\)[\s\S]*?)(?=---|\*\*ANSWER)/);
                        const answerMatch = description.match(/\*\*ANSWER:\s*(.*?)\*\*/);
                        const explanationMatch = description.match(/\*\*EXPLANATION:\*\*\s*([\s\S]*?)$/);
                        
                        const question = questionMatch ? questionMatch[1].trim() : '';
                        const optionsText = optionsMatch ? optionsMatch[1] : '';
                        const correctAnswer = answerMatch ? answerMatch[1].trim() : '';
                        const explanation = explanationMatch ? explanationMatch[1].trim() : '';
                        
                        // Parse options
                        const options = optionsText.split(/(?=[A-D]\))/).filter(o => o.trim()).map(opt => {
                          const match = opt.match(/([A-D])\)\s*(.*)/);
                          return match ? { letter: match[1], text: match[2].trim() } : null;
                        }).filter(Boolean);
                        
                        return (
                          <div className="max-w-4xl">
                            {/* Question Card */}
                            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-xl p-8 mb-6">
                              <div className="flex items-start gap-4 mb-6">
                                <span className="text-4xl">🧠</span>
                                <div className="flex-1">
                                  <h2 className="text-2xl font-bold text-white mb-4">Interactive MCQ</h2>
                                  <div className="text-lg text-gray-200 leading-relaxed whitespace-pre-wrap">{question}</div>
                                </div>
                              </div>
                              
                              {/* Options */}
                              <div className="space-y-3 mt-6">
                                {options.map((option: any) => {
                                  const isSelected = selectedAnswer === option.letter;
                                  const isCorrect = option.letter === correctAnswer.charAt(0);
                                  const showResult = showAnswer;
                                  
                                  return (
                                    <button
                                      key={option.letter}
                                      onClick={() => !showAnswer && setSelectedAnswer(option.letter)}
                                      disabled={showAnswer}
                                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                        showResult
                                          ? isCorrect
                                            ? 'bg-green-900/40 border-green-500 text-white'
                                            : isSelected
                                            ? 'bg-red-900/40 border-red-500 text-white'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400'
                                          : isSelected
                                          ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg'
                                          : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`font-bold text-xl ${
                                          showResult && isCorrect ? 'text-green-400' : 
                                          showResult && isSelected && !isCorrect ? 'text-red-400' :
                                          isSelected ? 'text-purple-400' : 'text-gray-500'
                                        }`}>
                                          {option.letter})
                                        </span>
                                        <span className="flex-1">{option.text}</span>
                                        {showResult && isCorrect && (
                                          <FaCheckCircle className="text-green-400 text-xl" />
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                          <FaTimes className="text-red-400 text-xl" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {/* Submit Button */}
                              {!showAnswer && selectedAnswer && (
                                <button
                                  onClick={() => setShowAnswer(true)}
                                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
                                >
                                  Check Answer
                                </button>
                              )}
                              
                              {/* Answer Explanation */}
                              {showAnswer && (
                                <div className={`mt-6 p-6 rounded-lg border-2 ${
                                  selectedAnswer === correctAnswer.charAt(0)
                                    ? 'bg-green-900/20 border-green-500/50'
                                    : 'bg-blue-900/20 border-blue-500/50'
                                }`}>
                                  <div className="flex items-start gap-3 mb-3">
                                    {selectedAnswer === correctAnswer.charAt(0) ? (
                                      <>
                                        <FaCheckCircle className="text-green-400 text-2xl mt-1" />
                                        <div>
                                          <h3 className="text-xl font-bold text-green-400 mb-2">Correct! 🎉</h3>
                                          <p className="text-gray-200">{explanation}</p>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <FaTimes className="text-yellow-400 text-2xl mt-1" />
                                        <div>
                                          <h3 className="text-xl font-bold text-yellow-400 mb-2">Not quite!</h3>
                                          <p className="text-gray-200 mb-2">The correct answer is: <strong className="text-white">{correctAnswer}</strong></p>
                                          <p className="text-gray-300">{explanation}</p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      
                      // Regular content (not MCQ)
                      return (
                        <div className="prose prose-invert prose-lg max-w-none">
                          {description.split('\n').map((line: string, index: number) => {
                            // Handle headers
                            if (line.startsWith('**') && line.endsWith('**')) {
                              const text = line.replace(/\*\*/g, '');
                              return <h2 key={index} className="text-2xl font-bold text-yellow-400 mt-8 mb-4">{text}</h2>;
                            }
                            
                            // Handle code blocks markers
                            if (line.startsWith('```')) {
                              return <div key={index} className="my-2"></div>;
                            }
                            
                            // Handle bullet points
                            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                              return <li key={index} className="text-gray-300 ml-6 mb-2">{line.trim().substring(1).trim()}</li>;
                            }
                            
                            // Handle inline code
                            if (line.includes('`') && !line.startsWith('```')) {
                              const parts = line.split('`');
                              return (
                                <p key={index} className="text-gray-300 mb-3 leading-relaxed">
                                  {parts.map((part: string, i: number) => 
                                    i % 2 === 0 ? part : <code key={i} className="bg-gray-800 text-yellow-300 px-2 py-1 rounded font-mono text-sm">{part}</code>
                                  )}
                                </p>
                              );
                            }
                            
                            // Handle bold text
                            if (line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={index} className="text-gray-300 mb-3 leading-relaxed">
                                  {parts.map((part: string, i: number) => 
                                    i % 2 === 0 ? part : <strong key={i} className="text-white font-semibold">{part}</strong>
                                  )}
                                </p>
                              );
                            }
                            
                            // Regular text
                            if (line.trim()) {
                              return <p key={index} className="text-gray-300 mb-3 leading-relaxed">{line}</p>;
                            }
                            
                            return <br key={index} />;
                          })}
                        </div>
                      );
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
