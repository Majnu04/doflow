import React, { useState, useMemo } from 'react';
import {
  FaChevronDown, FaChevronUp, FaChevronLeft, FaCheck,
  FaPlay, FaBook, FaCode, FaQuestionCircle, FaClipboardList, FaTimes, FaLock, FaCrown, FaSearch,
  FaClock
} from 'react-icons/fa';

interface LearningSidebarProps {
  course: any;
  currentModuleIndex: number;
  currentLessonIndex: number;
  expandedModules: Set<number>;
  isSidebarOpen: boolean;
  progress: any;
  progressPercent: number;
  sessionSeconds: number;
  formatSessionTime: (s: number) => string;
  onSelectLesson: (lesson: any, moduleIdx: number, lessonIdx: number) => void;
  onToggleModule: (idx: number) => void;
  onCloseSidebar: () => void;
  onBack: () => void;
  hasCoursePurchase: () => boolean;
}

const getLessonIcon = (lesson: any) => {
  const title = lesson?.title?.toLowerCase() || '';
  if (title.includes('quiz') || title.includes('mcq')) return <FaQuestionCircle className="w-3.5 h-3.5" />;
  if (title.includes('code') || title.includes('challenge') || title.includes('coding')) return <FaCode className="w-3.5 h-3.5" />;
  if (title.includes('test')) return <FaClipboardList className="w-3.5 h-3.5" />;
  return <FaPlay className="w-3.5 h-3.5" />;
};

const LearningSidebar: React.FC<LearningSidebarProps> = ({
  course,
  currentModuleIndex,
  currentLessonIndex,
  expandedModules,
  isSidebarOpen,
  progress,
  progressPercent,
  sessionSeconds,
  formatSessionTime,
  onSelectLesson,
  onToggleModule,
  onCloseSidebar,
  onBack,
  hasCoursePurchase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return course.sections;
    const q = searchQuery.toLowerCase();
    return course.sections.map((section: any) => ({
      ...section,
      lessons: section.lessons?.filter((l: any) =>
        l.title?.toLowerCase().includes(q)
      ) || [],
    })).filter((section: any) => section.lessons.length > 0);
  }, [course.sections, searchQuery]);

  const totalLessons = course.sections?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) || 0;
  const completedCount = progress?.completedLessons?.length || 0;

  return (
    <>
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={onCloseSidebar} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen w-[320px] flex flex-col
          bg-white border-r border-[var(--page-border)]
          transform transition-all duration-300 ease-[var(--ease-out-expo)]
          z-50
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ boxShadow: isSidebarOpen ? 'var(--shadow-2xl)' : undefined }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-[var(--page-border)]" style={{ background: 'var(--page-gradient)' }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-[var(--page-text-muted)] hover:text-[var(--page-text)] transition-colors">
              <FaChevronLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
            <button onClick={onCloseSidebar} className="lg:hidden p-1.5 hover:bg-black/5 rounded-lg transition-colors">
              <FaTimes className="w-4 h-4 text-[var(--page-text-muted)]" />
            </button>
          </div>

          <h2 className="font-bold text-[var(--page-text)] text-[15px] leading-snug line-clamp-2 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, system-ui' }}>
            {course.title}
          </h2>

          {/* Progress Ring + Stats */}
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--page-border)" strokeWidth="3" />
                <circle
                  cx="24" cy="24" r="20" fill="none"
                  stroke="var(--page-accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - progressPercent / 100)}`}
                  className="transition-all duration-700 ease-[var(--ease-out-expo)]"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--page-accent)]">{progressPercent}%</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--page-text-muted)]">
                <span className="font-semibold text-[var(--page-text)]">{completedCount}</span>/{totalLessons} lessons
              </div>
              {sessionSeconds > 0 && (
                <div className="flex items-center gap-1 text-xs text-[var(--page-text-muted)] mt-0.5">
                  <FaClock className="w-2.5 h-2.5" />
                  <span>{formatSessionTime(sessionSeconds)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--page-border)]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--page-text-muted)]" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--page-section)] border border-[var(--page-border)] rounded-xl text-sm text-[var(--page-text)] placeholder:text-[var(--page-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--page-accent)]/20 focus:border-[var(--page-accent)] transition-all"
            />
          </div>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--page-border) transparent' }}>
          <div className="p-3 space-y-2">
            {filteredModules.map((section: any, moduleIndex: number) => {
              const originalIndex = course.sections.findIndex((s: any) => s._id === section._id);
              const isExpanded = expandedModules.has(originalIndex);
              const moduleLessons = section.lessons || [];
              const moduleCompleted = moduleLessons.filter((l: any) =>
                progress?.completedLessons?.includes(l._id)
              ).length;
              const moduleTotal = moduleLessons.length;
              const modulePct = moduleTotal > 0 ? Math.round((moduleCompleted / moduleTotal) * 100) : 0;

              return (
                <div key={section._id || moduleIndex} className="rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => onToggleModule(originalIndex)}
                    className={`w-full px-3.5 py-3 flex items-center gap-3 text-left rounded-xl transition-all duration-200 group
                      ${isExpanded ? 'bg-[var(--page-accent-soft)]' : 'hover:bg-[var(--page-section)]'}`}
                  >
                    {/* Module number badge */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all
                      ${modulePct === 100 ? 'bg-emerald-100 text-emerald-700' : isExpanded ? 'bg-[var(--page-accent)] text-white' : 'bg-[var(--page-section)] text-[var(--page-text-muted)]'}`}>
                      {modulePct === 100 ? <FaCheck className="w-3.5 h-3.5" /> : originalIndex + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--page-text)] leading-tight line-clamp-1">
                        {section.title?.replace(/^Module \d+:\s*/, '') || section.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[var(--page-text-muted)]">{moduleCompleted}/{moduleTotal}</span>
                        {modulePct > 0 && modulePct < 100 && (
                          <div className="flex-1 h-1 bg-[var(--page-border)] rounded-full overflow-hidden max-w-[60px]">
                            <div className="h-full bg-[var(--page-accent)] rounded-full transition-all duration-500" style={{ width: `${modulePct}%` }} />
                          </div>
                        )}
                      </div>
                    </div>

                    <FaChevronDown className={`w-3.5 h-3.5 text-[var(--page-text-muted)] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-[var(--page-border)] space-y-0.5 py-1">
                      {moduleLessons.map((lesson: any, lessonIndex: number) => {
                        const isActive = currentModuleIndex === originalIndex && currentLessonIndex === lessonIndex;
                        const isCompleted = progress?.completedLessons?.includes(lesson._id);

                        return (
                          <button
                            key={lesson._id || lessonIndex}
                            onClick={() => onSelectLesson(lesson, originalIndex, lessonIndex)}
                            className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left rounded-lg transition-all duration-200 group
                              ${isActive
                                ? 'bg-[var(--page-accent)]/10 border border-[var(--page-accent)]/20 -ml-px pl-[13px]'
                                : 'hover:bg-[var(--page-section)] border border-transparent'
                              }`}
                          >
                            <div className={`flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-all
                              ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-[var(--page-accent)] text-white' : 'bg-[var(--page-section)] text-[var(--page-text-muted)] group-hover:bg-[var(--page-border)]'}`}>
                              {isCompleted ? <FaCheck className="w-2.5 h-2.5" /> : getLessonIcon(lesson)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className={`text-[12.5px] leading-tight line-clamp-2 transition-colors
                                ${isActive ? 'font-semibold text-[var(--page-accent)]' : isCompleted ? 'text-[var(--page-text-muted)]' : 'text-[var(--page-text)] group-hover:text-[var(--page-text)]'}`}>
                                {lesson.title}
                              </div>
                              {lesson.duration && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] text-[var(--page-text-muted)]/70">{lesson.duration} min</span>
                                </div>
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
};

export default React.memo(LearningSidebar);
