import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaEdit, FaTimes, FaSearch, FaChartBar } from 'react-icons/fa';
import api from '../../src/utils/api';
import toast from 'react-hot-toast';

interface Lesson {
  _id: string;
  sectionIndex: number;
  lessonIndex: number;
  title: string;
  description: string;
  duration: number;
  quizCount: number;
  interviewCount: number;
  contentLength: number;
  isPreview: boolean;
}

interface CourseStats {
  courseTitle: string;
  totalLessons: number;
  totalDuration: number;
  lessonsWithQuiz: number;
  lessonsWithInterview: number;
  totalQuizzes: number;
  totalInterviews: number;
  totalContentCharacters: number;
  averageContentPerLesson: number;
}

const PythonCourseAdminDashboard: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const normalizeQuizToShortAnswer = (quiz: any) => {
    if (!quiz || !Array.isArray(quiz.questions)) return quiz;
    const questions = quiz.questions.map((q: any) => {
      const prompt = String(q?.prompt || '').trim();
      const explanation = String(q?.explanation || '').trim();
      const expectedAnswerExisting = typeof q?.expectedAnswer === 'string' ? q.expectedAnswer.trim() : '';
      if (expectedAnswerExisting) {
        return { prompt, expectedAnswer: expectedAnswerExisting, explanation };
      }

      let expectedAnswer = '';
      if (Array.isArray(q?.options) && q.options.length) {
        const ai = Number.isInteger(q?.answerIndex) ? q.answerIndex : 0;
        expectedAnswer = String(q.options[ai] ?? q.options[0] ?? '').trim();
      }

      return { prompt, expectedAnswer, explanation };
    });
    return { title: quiz.title, questions };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, statsRes] = await Promise.all([
        api.get('/admin/python-course/lessons'),
        api.get('/admin/python-course/stats')
      ]);
      setLessons(lessonsRes.data.lessons);
      setStats(statsRes.data);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load course data');
      console.error(err);
      setIsLoading(false);
    }
  };

  const openEditModal = async (lesson: Lesson) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/python-course/lessons/${lesson.sectionIndex}/${lesson.lessonIndex}`);
      setEditingLesson(lesson);
      const incoming = res.data;
      if (incoming?.quiz) incoming.quiz = normalizeQuizToShortAnswer(incoming.quiz);
      setFormData(incoming);
      setShowEditModal(true);
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load lesson details');
      setIsLoading(false);
    }
  };

  const saveLesson = async () => {
    if (!editingLesson || !formData) return;
    try {
      setIsLoading(true);
      const payload = { ...formData };
      if (payload?.quiz) payload.quiz = normalizeQuizToShortAnswer(payload.quiz);
      await api.put(
        `/admin/python-course/lessons/${editingLesson.sectionIndex}/${editingLesson.lessonIndex}`,
        payload
      );
      toast.success('Lesson updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to update lesson');
      setIsLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !lessons.length) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-light-textSecondary dark:text-dark-muted">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Header */}
      <div className="border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/#/admin-dashboard" className="inline-flex items-center gap-2 text-light-text dark:text-dark-text hover:text-brand-primary">
                <FaArrowLeft />
                <span>Back</span>
              </a>
              <div>
                <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Python Course Admin</h1>
                <p className="text-sm text-light-textMuted dark:text-dark-muted">Manage lessons, quizzes, and interviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-textMuted dark:text-dark-muted">Total Lessons</p>
                  <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1">{stats.totalLessons}</p>
                </div>
                <FaChartBar className="text-4xl text-brand-primary opacity-20" />
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-textMuted dark:text-dark-muted">Lessons with Quiz</p>
                  <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1">{stats.lessonsWithQuiz}</p>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted mt-1">{stats.totalQuizzes} total questions</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-textMuted dark:text-dark-muted">Lessons with Interview</p>
                  <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1">{stats.lessonsWithInterview}</p>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted mt-1">{stats.totalInterviews} total questions</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-textMuted dark:text-dark-muted">Avg Content/Lesson</p>
                  <p className="text-3xl font-bold text-light-text dark:text-dark-text mt-1">{stats.averageContentPerLesson}</p>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted mt-1">characters</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-light-textMuted dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text placeholder-light-textMuted dark:placeholder-dark-muted focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Lessons Table */}
        <div className="rounded-2xl border border-border-subtle dark:border-dark-border overflow-hidden bg-light-card dark:bg-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-light-cardAlt dark:bg-dark-cardAlt border-b border-border-subtle dark:border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Lesson Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Content</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Quiz</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Interview</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-light-text dark:text-dark-text">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson, idx) => (
                  <tr key={`${lesson.sectionIndex}-${lesson.lessonIndex}`} className={idx % 2 === 0 ? 'bg-light-card dark:bg-dark-card' : 'bg-light-cardAlt dark:bg-dark-cardAlt'}>
                    <td className="px-6 py-4 text-sm text-light-text dark:text-dark-text font-medium">{lesson.title}</td>
                    <td className="px-6 py-4 text-sm text-light-textSecondary dark:text-dark-muted">{lesson.duration} min</td>
                    <td className="px-6 py-4 text-sm text-light-textSecondary dark:text-dark-muted">{lesson.contentLength} chars</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${lesson.quizCount > 0 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                        {lesson.quizCount} Q
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${lesson.interviewCount > 0 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                        {lesson.interviewCount} Q
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => openEditModal(lesson)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLesson && formData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl">
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Edit Lesson</h2>
              <button onClick={() => setShowEditModal(false)} className="text-light-textMuted dark:text-dark-muted hover:text-light-text">
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Lesson Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt text-light-text dark:text-dark-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration || 0}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt text-light-text dark:text-dark-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt text-light-text dark:text-dark-text focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Content</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt text-light-text dark:text-dark-text font-mono text-sm focus:outline-none focus:border-brand-primary"
                />
              </div>

              {/* Quiz editor: short-answer (fill-in-the-blank) style */}
              {formData.quiz && (
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Quiz ({formData.quiz.questions?.length || 0} questions)</label>
                  <div className="space-y-4">
                    {formData.quiz.questions && formData.quiz.questions.map((q: any, qi: number) => (
                      <div key={qi} className="p-4 rounded-xl border border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt">
                        <div className="flex items-start justify-between gap-4">
                          <textarea
                            value={q.prompt || ''}
                            onChange={(e) => {
                              const newQuestions = [...formData.quiz.questions];
                              newQuestions[qi] = { ...newQuestions[qi], prompt: e.target.value };
                              setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                            }}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-border-subtle dark:border-dark-border bg-white/0 text-light-text dark:text-dark-text focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const newQuestions = formData.quiz.questions.filter((_: any, i: number) => i !== qi);
                              setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                            }}
                            className="ml-2 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="mt-3 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-light-textSecondary dark:text-dark-muted mb-1">Expected answer</label>
                            <input
                              type="text"
                              value={q.expectedAnswer || ''}
                              onChange={(e) => {
                                const newQuestions = [...formData.quiz.questions];
                                newQuestions[qi] = { ...newQuestions[qi], expectedAnswer: e.target.value };
                                setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-border-subtle dark:border-dark-border bg-white/0 text-light-text dark:text-dark-text focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-light-textSecondary dark:text-dark-muted mb-1">Explanation (optional)</label>
                            <textarea
                              value={q.explanation || ''}
                              onChange={(e) => {
                                const newQuestions = [...formData.quiz.questions];
                                newQuestions[qi] = { ...newQuestions[qi], explanation: e.target.value };
                                setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                              }}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-border-subtle dark:border-dark-border bg-white/0 text-light-text dark:text-dark-text focus:outline-none"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newQuestions = [...formData.quiz.questions];
                                const newQ = { prompt: 'New question', expectedAnswer: '', explanation: '' };
                                newQuestions.splice(qi + 1, 0, newQ);
                                setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                              }}
                              className="px-3 py-1.5 rounded-md bg-green-600 text-white"
                            >
                              Insert question after
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div>
                      <button
                        onClick={() => {
                          const newQuestions = [...(formData.quiz.questions || [])];
                          newQuestions.push({ prompt: 'New question', expectedAnswer: '', explanation: '' });
                          setFormData({ ...formData, quiz: { ...formData.quiz, questions: newQuestions } });
                        }}
                        className="px-4 py-2 rounded-xl bg-brand-primary text-white"
                      >
                        Add question
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Interview JSON Display */}
              {formData.interview && (
                <div>
                  <label className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2">Interview ({formData.interview.questions?.length || 0} questions)</label>
                  <div className="bg-light-cardAlt dark:bg-dark-cardAlt px-4 py-3 rounded-xl border border-border-subtle dark:border-dark-border overflow-auto max-h-64">
                    <pre className="text-xs text-light-textSecondary dark:text-dark-muted">
                      {JSON.stringify(formData.interview, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 flex gap-4 justify-end p-6 border-t border-border-subtle dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 rounded-xl border border-border-subtle dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition"
              >
                Cancel
              </button>
              <button
                onClick={saveLesson}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PythonCourseAdminDashboard;
