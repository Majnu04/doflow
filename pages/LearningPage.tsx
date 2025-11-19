import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import api from '../src/utils/api';
import ReactPlayer from 'react-player';
import { FaCheck, FaLock, FaPlay, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import toast from '../src/utils/toast';

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
    
    // Get signed URL for video
    try {
      const response = await api.get(`/upload/signed-url?key=${lesson.videoUrl}`);
      setVideoUrl(response.data.url);
    } catch (error) {
      console.error('Failed to get video URL:', error);
      setVideoUrl(lesson.videoUrl); // Fallback to direct URL
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
    <div className="min-h-screen bg-black">
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

                <div className="bg-gray-900 p-6">
                  <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-gray-400 mb-4">{currentLesson.description}</p>

                  <div className="flex gap-4">
                    <button
                      onClick={markLessonComplete}
                      className="btn-primary"
                    >
                      <FaCheck className="inline mr-2" />
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
                            className="btn-secondary"
                          >
                            <FaDownload className="inline mr-2" />
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
        <div className="w-full lg:w-96 bg-gray-900 overflow-y-auto" style={{ maxHeight: '100vh' }}>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold mb-2">{course.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{progress.enrollment?.progress || 0}% Complete</span>
              <span>{progress.enrollment?.completedLessons?.length || 0} / {course.totalLessons} Lessons</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-brand-primary to-brand-blue h-2 rounded-full"
                style={{ width: `${progress.enrollment?.progress || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4">
            {course.sections.map((section: any, sectionIndex: number) => (
              <div key={sectionIndex} className="mb-4">
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                >
                  <span className="font-bold">{section.title}</span>
                  {expandedSections.has(sectionIndex) ? <FaChevronUp /> : <FaChevronDown />}
                </button>

                {expandedSections.has(sectionIndex) && (
                  <div className="mt-2 space-y-2">
                    {section.lessons.map((lesson: any) => {
                      const isCompleted = isLessonCompleted(lesson._id);
                      const isCurrent = currentLesson?._id === lesson._id;

                      return (
                        <button
                          key={lesson._id}
                          onClick={() => selectLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            isCurrent
                              ? 'bg-brand-primary bg-opacity-20 border border-brand-primary'
                              : 'bg-gray-800 hover:bg-gray-750'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                  <FaCheck className="text-xs" />
                                </div>
                              ) : lesson.isPreview ? (
                                <FaPlay className="text-brand-primary" />
                              ) : (
                                <FaLock className="text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{lesson.title}</div>
                              <div className="text-xs text-gray-400">{lesson.duration} min</div>
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
