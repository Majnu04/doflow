import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import ReactPlayer from 'react-player';
import { FaCheck, FaLock, FaPlay, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
        {/* Video Player */}
        <div className="flex-1 bg-black">
          <div className="sticky top-0">
            {currentLesson && (
              <div>
                <div className="aspect-video bg-black">
                  <ReactPlayer
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                    config={{
                      file: {
                        attributes: {
                          controlsList: 'nodownload'
                        }
                      }
                    }}
                  />
                </div>

                <div className="bg-gray-900 p-6 border-t border-gray-800">
                  <h1 className="text-2xl font-bold text-white mb-3">{currentLesson.title}</h1>
                  <p className="text-gray-300 mb-6 leading-relaxed">{currentLesson.description}</p>

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={markLessonComplete}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200"
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
