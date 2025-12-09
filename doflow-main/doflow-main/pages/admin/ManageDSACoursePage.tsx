import React, { useState, useEffect, useMemo } from 'react';
import {
  FiPlus,
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronRight,
  FiCode,
  FiLayers,
  FiBookOpen,
  FiSettings,
  FiList,
  FiInfo,
  FiTarget,
  FiVideo,
  FiPlayCircle,
  FiFilm,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import { Button, Card, Modal, Input, Textarea, Select } from '../../src/components/ui';
import api from '../../src/utils/api';
import { isDsaCourse } from '../../src/utils/courseUtils';
import toast from "react-hot-toast";

const LANGUAGE_SIGNATURES: Record<string, string> = {
  javascript: 'function solve(...args)',
  python: 'def solve(*args)',
  java: 'class Solution { static Object solve(String[] args) }',
  cpp: 'std::string solve(const std::vector<std::string>& args)',
  c: 'const char* solve(int argc, const char* argv[])',
};

const ADAPTER_SNIPPETS: Record<string, string> = {
  javascript: `function __doflow_entry(...args) {
  // TODO: parse args and call your visible stub, e.g. twoSum(nums, target)
  return '';
}`,
  python: `def __doflow_entry(*args):
    """Parse args and call your visible stub"""
    return ''
`,
  java: `public final class DoFlowAdapter {
    private DoFlowAdapter() {}

    public static Object __doflow_entry(String[] args) {
        // TODO: parse args and call Solution.yourMethod(...)
        return "";
    }
}
`,
  cpp: `std::string __doflow_entry(const std::vector<std::string>& args) {
    // TODO: parse args and call Solution().yourMethod(...)
    return "";
}
`,
  c: `const char* __doflow_entry(int argc, const char* argv[]) {
    // TODO: parse args and call your function
    return "";
}
`,
};

const formatPreviewArg = (value: any) => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    return value.length > 32 ? `"${value.slice(0, 32)}…"` : `"${value}"`;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 48 ? serialized.slice(0, 48) + '…' : serialized;
  } catch (error) {
    return String(value);
  }
};

const splitTopLevel = (input: string) => {
  const parts: string[] = [];
  let current = '';
  let depth = 0;
  const openings = '([{';
  const closings = ')]}';

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === ',' && depth === 0) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;

    const openIndex = openings.indexOf(char);
    if (openIndex !== -1) {
      depth += 1;
      continue;
    }

    const closeIndex = closings.indexOf(char);
    if (closeIndex !== -1 && depth > 0) {
      depth -= 1;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
};

const tryParseLiteral = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.length) return '';
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return trimmed;
  }
};

const parseTestCaseArgsPreview = (rawInput: string) => {
  if (!rawInput || !rawInput.trim()) {
    return { status: 'empty', args: [] as any[] };
  }

  const normalized = rawInput.trim();
  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return { status: 'json-array', args: parsed };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.args)) {
      return { status: 'json-object-args', args: parsed.args };
    }
    return { status: 'json-value', args: [parsed] };
  } catch (error) {
    const parts = splitTopLevel(normalized);
    const extracted = parts
      .map(segment => {
        const equalsIndex = segment.indexOf('=');
        if (equalsIndex === -1) return null;
        const rhs = segment.slice(equalsIndex + 1).trim();
        return rhs.length ? rhs : null;
      })
      .filter(Boolean) as string[];

    if (extracted.length > 0) {
      const args = extracted.map(value => tryParseLiteral(value));
      return { status: 'assignment-list', args };
    }

    return { status: 'raw-string', args: [normalized] };
  }
};

const describeTestCasePreview = (rawInput: string) => {
  const parsed = parseTestCaseArgsPreview(rawInput);
  if (parsed.status === 'empty') {
    return { tone: 'muted', message: 'Tip: use a JSON array such as [[2,7,11,15], 9].' };
  }

  const argsPreview = parsed.args.map(formatPreviewArg).join(', ');
  if (parsed.status === 'raw-string') {
    return {
      tone: 'warning',
      message: `Will treat the entire string as a single argument → solve("${argsPreview.replace(/"/g, '')}")`,
    };
  }

  return {
    tone: 'success',
    message: `Will call solve(${argsPreview || '—'})`,
  };
};

type CourseMode = 'dsa' | 'video';

interface ManageDSACoursePageProps {
  initialMode?: CourseMode;
}

const ManageDSACoursePage: React.FC<ManageDSACoursePageProps> = ({ initialMode = 'dsa' }) => {
  const [courseMode, setCourseMode] = useState<CourseMode>(initialMode);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [dsaSections, setDsaSections] = useState<any[]>([]);
  const [dsaProblems, setDsaProblems] = useState<any[]>([]);
  const [videoSections, setVideoSections] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedVideoSection, setExpandedVideoSection] = useState<string | null>(null);

  const dsaCourses = useMemo(() => allCourses.filter(isDsaCourse), [allCourses]);
  const videoCourses = useMemo(() => allCourses.filter((course) => !isDsaCourse(course)), [allCourses]);
  const activeCourseList = courseMode === 'dsa' ? dsaCourses : videoCourses;

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (!hours) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const selectedCourseDetails = allCourses.find(course => course._id === selectedCourse);
  const totalProblems = dsaProblems.length;
  const freeProblems = dsaProblems.filter(problem => problem.isFree).length;
  const totalLessons = videoSections.reduce((count, section) => count + (section?.lessons?.length || 0), 0);
  const totalVideoDuration = videoSections.reduce((minutes, section) => {
    const sectionDuration = (section?.lessons || []).reduce((sum: number, lesson: any) => sum + (Number(lesson?.duration) || 0), 0);
    return minutes + sectionDuration;
  }, 0);
  const lastSyncedAt = selectedCourseDetails?.updatedAt || selectedCourseDetails?.lastUpdated;
  const heroStats = courseMode === 'dsa'
    ? [
        { label: 'Total Sections', value: dsaSections.length },
        { label: 'Problems Authored', value: totalProblems }
      ]
    : [
        { label: 'Modules', value: videoSections.length },
        { label: 'Lessons Authored', value: totalLessons }
      ];
  const snapshotMetrics = courseMode === 'dsa'
    ? [
        { label: 'Sections', value: dsaSections.length },
        { label: 'Problems', value: totalProblems },
        { label: 'Free Previews', value: freeProblems },
        { label: 'Last Sync', value: lastSyncedAt ? new Date(lastSyncedAt).toLocaleDateString() : '—' }
      ]
    : [
        { label: 'Modules', value: videoSections.length },
        { label: 'Lessons', value: totalLessons },
        { label: 'Duration', value: formatDuration(totalVideoDuration) },
        { label: 'Publish State', value: selectedCourseDetails?.isPublished ? 'Published' : 'Draft' }
      ];
  const heroTitle = courseMode === 'dsa' ? 'DSA Course Orchestration' : 'Video Course Studio';
  const heroDescription = courseMode === 'dsa'
    ? 'Curate data-structure drills, sections, and problems with the same confidence you had on the college dashboard.'
    : 'Design long-form video classes, modules, and lessons—perfect for web development or cohort-based curriculums.';

  // Modal states
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editingProblem, setEditingProblem] = useState<any>(null);

  const [isVideoSectionModalOpen, setIsVideoSectionModalOpen] = useState(false);
  const [editingVideoSection, setEditingVideoSection] = useState<any>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonSectionId, setLessonSectionId] = useState<string>('');
  const [isSavingVideoStructure, setIsSavingVideoStructure] = useState(false);

  useEffect(() => {
    setCourseMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const list = courseMode === 'dsa' ? dsaCourses : videoCourses;
    setSelectedCourse((prev) => {
      if (!list.length) {
        return '';
      }
      if (prev && list.some(course => course._id === prev)) {
        return prev;
      }
      return list[0]._id;
    });
  }, [courseMode, dsaCourses, videoCourses]);

  useEffect(() => {
    setSelectedSection(null);
    setExpandedVideoSection(null);
  }, [courseMode]);

  useEffect(() => {
    if (!selectedCourse) {
      setDsaSections([]);
      setDsaProblems([]);
      setVideoSections([]);
      return;
    }

    if (courseMode === 'dsa') {
      fetchDsaSections(selectedCourse);
    } else {
      fetchVideoCourseStructure(selectedCourse);
    }
  }, [selectedCourse, courseMode]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/admin/courses', {
        params: {
          limit: 100,
        },
      });

      const courseList = Array.isArray(data?.courses) ? data.courses : [];
      setAllCourses(courseList);
      if (!courseList.length) {
        setSelectedCourse('');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch courses');
    }
  };

  const fetchDsaSections = async (courseId: string) => {
    try {
      const { data } = await api.get(`/dsa/sections?courseId=${courseId}`);
      setDsaSections(data);
      fetchDsaProblems(courseId);
    } catch (error) {
      toast.error('Failed to fetch sections');
    }
  };

  const fetchDsaProblems = async (courseId: string) => {
    try {
      const { data } = await api.get(`/dsa/problems?courseId=${courseId}`);
      // Handle both paginated and non-paginated responses
      const problemsArray = data.problems || data;
      setDsaProblems(problemsArray);
    } catch (error) {
      toast.error('Failed to fetch problems');
    }
  };

  const fetchVideoCourseStructure = async (courseId: string) => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setVideoSections(Array.isArray(data?.sections) ? data.sections : []);
    } catch (error) {
      toast.error('Failed to fetch course modules');
    }
  };

  const persistVideoStructure = async (updatedSections: any[], successMessage: string) => {
    if (!selectedCourse) return;
    setIsSavingVideoStructure(true);
    try {
      await api.put(`/courses/${selectedCourse}`, { sections: updatedSections });
      await fetchVideoCourseStructure(selectedCourse);
      toast.success(successMessage);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save course structure');
    } finally {
      setIsSavingVideoStructure(false);
    }
  };

  const openVideoSectionModal = (section: any = null) => {
    setEditingVideoSection(section);
    setIsVideoSectionModalOpen(true);
  };

  const closeVideoSectionModal = () => {
    setIsVideoSectionModalOpen(false);
    setEditingVideoSection(null);
  };

  const handleVideoSectionSubmit = async (formData: any) => {
    const normalizedSection = {
      title: formData.title,
      order: Number(formData.order) || 0,
      lessons: editingVideoSection?.lessons || [],
    };

    let updatedSections = videoSections;
    if (editingVideoSection?._id) {
      updatedSections = videoSections.map(section =>
        section._id === editingVideoSection._id
          ? { ...section, ...normalizedSection }
          : section
      );
    } else {
      updatedSections = [...videoSections, { ...normalizedSection, lessons: [] }];
    }

    await persistVideoStructure(
      updatedSections,
      editingVideoSection ? 'Module updated successfully' : 'Module created successfully'
    );
    closeVideoSectionModal();
  };

  const handleDeleteVideoSection = async (sectionId: string) => {
    if (!window.confirm('Delete this module along with all of its lessons?')) return;
    const updatedSections = videoSections.filter(section => section._id !== sectionId);
    await persistVideoStructure(updatedSections, 'Module removed successfully');
  };

  const openLessonModal = (sectionId: string, lesson: any = null) => {
    const fallbackSectionId = sectionId || videoSections[0]?._id || '';
    setLessonSectionId(fallbackSectionId);
    setEditingLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    setLessonSectionId('');
  };

  const handleLessonSubmit = async (targetSectionId: string, lessonData: any) => {
    if (!targetSectionId) {
      toast.error('Select a module for this lesson');
      return;
    }

    const normalizedLesson = {
      ...lessonData,
      order: Number(lessonData.order) || 0,
      duration: Number(lessonData.duration) || 0,
      resources: (lessonData.resources || []).map((resource: any) => ({
        title: resource.title,
        url: resource.url,
        type: resource.type || 'video'
      })),
    };

    const updatedSections = videoSections.map(section => {
      if (section._id !== targetSectionId) return section;
      const lessons = Array.isArray(section.lessons) ? [...section.lessons] : [];
      if (editingLesson?._id) {
        const idx = lessons.findIndex((lesson: any) => lesson._id === editingLesson._id);
        if (idx !== -1) {
          lessons[idx] = { ...lessons[idx], ...normalizedLesson };
        } else {
          lessons.push(normalizedLesson);
        }
      } else {
        lessons.push(normalizedLesson);
      }
      return { ...section, lessons };
    });

    await persistVideoStructure(
      updatedSections,
      editingLesson ? 'Lesson updated successfully' : 'Lesson added successfully'
    );
    closeLessonModal();
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    const updatedSections = videoSections.map(section => {
      if (section._id !== sectionId) return section;
      return {
        ...section,
        lessons: (section.lessons || []).filter((lesson: any) => lesson._id !== lessonId)
      };
    });
    await persistVideoStructure(updatedSections, 'Lesson removed successfully');
  };

  const handleSectionSubmit = async (formData: any) => {
    try {
      if (editingSection) {
        await api.put(`/dsa/sections/${editingSection._id}`, formData);
        toast.success('Section updated successfully');
      } else {
        await api.post('/dsa/sections', { ...formData, courseId: selectedCourse });
        toast.success('Section created successfully');
      }
      fetchDsaSections(selectedCourse);
      closeSectionModal();
    } catch (error) {
      toast.error('Failed to save section');
    }
  };

  const handleProblemSubmit = async (formData: any) => {
    try {
      if (editingProblem?._id) {
        await api.put(`/dsa/problems/${editingProblem._id}`, formData);
        toast.success('Problem updated successfully');
      } else {
        await api.post('/dsa/problems', { ...formData, course: selectedCourse });
        toast.success('Problem created successfully');
      }
      fetchDsaProblems(selectedCourse);
      closeProblemModal();
    } catch (error) {
      toast.error('Failed to save problem');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (window.confirm('Are you sure? This will delete all problems in this section.')) {
      try {
        await api.delete(`/dsa/sections/${sectionId}`);
        toast.success('Section deleted');
        fetchDsaSections(selectedCourse);
      } catch (error) {
        toast.error('Failed to delete section');
      }
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await api.delete(`/dsa/problems/${problemId}`);
        toast.success('Problem deleted');
        fetchDsaProblems(selectedCourse);
      } catch (error) {
        toast.error('Failed to delete problem');
      }
    }
  };

  // Modal handling
  const openSectionModal = (section = null) => {
    setEditingSection(section);
    setIsSectionModalOpen(true);
  };
  const closeSectionModal = () => setIsSectionModalOpen(false);

  const openProblemModal = (problem: any = null, sectionId: string | null = null) => {
    if (problem) {
      setEditingProblem(problem);
    } else {
      setEditingProblem(sectionId ? { section: sectionId } : null);
    }
    setIsProblemModalOpen(true);
  };
  const closeProblemModal = () => {
    setIsProblemModalOpen(false);
    setEditingProblem(null);
  };

  return (
    <div className="min-h-screen bg-light-bg text-light-text pt-32 pb-16 px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="bg-gradient-to-r from-brand-primary/10 via-[#FFE8DC] to-white border border-border-subtle rounded-3xl p-6 lg:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-lg shadow-brand-primary/5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-brand-primary/15 text-brand-primary flex items-center justify-center shadow-inner">
            {courseMode === 'dsa' ? <FiCode className="text-3xl" /> : <FiVideo className="text-3xl" />}
          </div>
          <div>
            <p className="uppercase tracking-[0.35em] text-light-textMuted text-xs">{courseMode === 'dsa' ? 'Admin Control' : 'Studio Mode'}</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-light-text">{heroTitle}</h1>
            <p className="text-base text-light-textSecondary mt-2 max-w-2xl">{heroDescription}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="flex bg-white rounded-full p-1 border border-border-subtle shadow-inner">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${courseMode === 'dsa' ? 'bg-brand-primary text-white shadow-lg' : 'text-light-textMuted hover:text-brand-primary'}`}
              onClick={() => setCourseMode('dsa')}
            >
              <FiCode /> DSA Playbooks
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${courseMode === 'video' ? 'bg-brand-primary text-white shadow-lg' : 'text-light-textMuted hover:text-brand-primary'}`}
              onClick={() => setCourseMode('video')}
            >
              <FiFilm /> Video Classes
            </button>
          </div>
          <div className="flex gap-6">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-right">
                <p className="text-xs uppercase tracking-widest text-light-textMuted">{stat.label}</p>
                <p className="text-3xl font-semibold text-light-text">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false} className="bg-light-card border border-border-subtle text-light-text shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
              <FiBookOpen className="text-2xl" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-light-textMuted">Course Scope</p>
              <h2 className="text-2xl font-semibold">
                {courseMode === 'dsa' ? 'Select Your DSA Track' : 'Select a Video Course'}
              </h2>
            </div>
          </div>
          <Select
            name={`selectedCourse-${courseMode}`}
            label={courseMode === 'dsa' ? 'Select DSA Course' : 'Select Video Course'}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select a Course --</option>
            {activeCourseList.map((course) => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </Select>

          {selectedCourseDetails ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                  <p className="text-xs uppercase tracking-widest text-light-textMuted">Level</p>
                  <p className="text-xl font-semibold">{selectedCourseDetails.level || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                  <p className="text-xs uppercase tracking-widest text-light-textMuted">Pricing</p>
                  <p className="text-xl font-semibold">₹{selectedCourseDetails.price ?? 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                  <p className="text-xs uppercase tracking-widest text-light-textMuted">Enrollments</p>
                  <p className="text-xl font-semibold">{selectedCourseDetails.enrollmentCount ?? 0}</p>
                </div>
                <div className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                  <p className="text-xs uppercase tracking-widest text-light-textMuted">Language</p>
                  <p className="text-xl font-semibold">{selectedCourseDetails.language || 'English'}</p>
                </div>
              </div>
              <p className="text-sm text-light-textSecondary leading-relaxed">
                {selectedCourseDetails.shortDescription || 'Keep your learners on track by ensuring each module has a clear outcome and destination.'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-light-textMuted mt-6">
              {activeCourseList.length
                ? 'Select a course to inspect its structure.'
                : courseMode === 'dsa'
                  ? 'No DSA courses detected. Create one from the courses module to begin.'
                  : 'No video classes detected. Publish a course first, then stitch modules here.'}
            </p>
          )}
        </Card>

        <Card hover={false} className="bg-light-card border border-border-subtle text-light-text shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-amber-400/20 text-amber-600">
              {courseMode === 'dsa' ? <FiSettings className="text-2xl" /> : <FiLayers className="text-2xl" />}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-light-textMuted">Operational Snapshot</p>
              <h2 className="text-2xl font-semibold">Content Health</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {snapshotMetrics.map((metric) => (
              <div key={metric.label} className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                <p className="text-xs uppercase tracking-widest text-light-textMuted">{metric.label}</p>
                <p className="text-3xl font-semibold">{metric.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            {courseMode === 'dsa' ? (
              <>
                <Button onClick={() => openSectionModal()} icon={<FiPlus />} disabled={!selectedCourse}>
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openProblemModal(null, dsaSections[0]?._id || null)}
                  icon={<FiCode />}
                  disabled={!dsaSections.length}
                >
                  New Problem
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => openVideoSectionModal()}
                  icon={<FiPlus />}
                  disabled={!selectedCourse || isSavingVideoStructure}
                >
                  New Module
                </Button>
                <Button
                  variant="outline"
                  onClick={() => openLessonModal(videoSections[0]?._id || '', null)}
                  icon={<FiPlayCircle />}
                  disabled={!videoSections.length || isSavingVideoStructure}
                >
                  Quick Lesson
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>

      {courseMode === 'dsa' ? (
        selectedCourse ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <FiLayers className="text-2xl" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-light-textMuted">Content Architecture</p>
                  <h2 className="text-3xl font-semibold">Section & Problem Matrix</h2>
                </div>
              </div>
              <div className="text-sm text-light-textSecondary max-w-xl">
                Expand a section to curate its problem bank, mirroring the structured admin flows from the college dashboard.
              </div>
            </div>

            {dsaSections.length > 0 ? (
              <div className="space-y-4">
                {dsaSections.map((section) => {
                  const isExpanded = selectedSection === section._id;
                  const relatedProblems = dsaProblems.filter((p) => p.section === section._id);
                  return (
                    <Card key={section._id} hover={false} className="bg-light-card border border-border-subtle text-light-text shadow-sm">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => setSelectedSection(isExpanded ? null : section._id)}
                              className="h-10 w-10 rounded-2xl border border-border-subtle flex items-center justify-center bg-light-cardAlt"
                              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                            >
                              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                            </button>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-light-textMuted">Section {section.order ?? dsaSections.indexOf(section) + 1}</p>
                              <h3 className="text-2xl font-semibold">{section.title}</h3>
                              {section.description && (
                                <p className="text-sm text-light-textSecondary mt-1 max-w-2xl">{section.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openSectionModal(section)} icon={<FiEdit />}>
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSection(section._id)}
                              icon={<FiTrash />}
                              className="text-red-500 border-red-600 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-border-subtle pt-4 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3 text-light-textSecondary">
                                <FiList />
                                <p className="text-lg italic font-semibold">Problems</p>
                                <span className="text-xs uppercase tracking-widest text-light-textMuted">{relatedProblems.length} items</span>
                              </div>
                              <Button size="sm" onClick={() => openProblemModal(null, section._id)} icon={<FiPlus />}>
                                Add Problem
                              </Button>
                            </div>

                            {relatedProblems.length > 0 ? (
                              <div className="space-y-3">
                                {relatedProblems.map((problem) => (
                                  <div key={problem._id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70">
                                    <div>
                                      <p className="text-lg font-semibold">{problem.title}</p>
                                      <p className="text-sm text-light-textSecondary">
                                        Difficulty: {problem.difficulty} • {problem.isFree ? 'Free Preview' : 'Premium'}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" onClick={() => openProblemModal(problem)} icon={<FiEdit />}>
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteProblem(problem._id)}
                                        icon={<FiTrash />}
                                        className="text-red-500 border-red-600 hover:bg-red-500/10"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 rounded-2xl bg-light-cardAlt border border-dashed border-border-subtle text-sm text-light-textMuted">
                                No problems in this section yet. Use “Add Problem” to mirror the college admin workflow.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card hover={false} className="bg-light-card border border-dashed border-border-subtle text-light-textSecondary">
                <p>No sections available yet. Start by crafting your first section using the quick action above.</p>
              </Card>
            )}
          </div>
        ) : (
          <Card hover={false} className="bg-light-card border border-dashed border-border-subtle text-light-textSecondary">
            <p>Select a DSA course to view and manage its sections and problems.</p>
          </Card>
        )
      ) : selectedCourse ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-brand-primary/10 text-brand-primary">
                <FiVideo className="text-2xl" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-light-textMuted">Module Designer</p>
                <h2 className="text-3xl font-semibold">Modules & Lessons Matrix</h2>
              </div>
            </div>
            <div className="text-sm text-light-textSecondary max-w-xl">
              Expand a module to manage its lessons, timings, and preview settings for your video cohorts.
            </div>
          </div>

          {videoSections.length > 0 ? (
            <div className="space-y-4">
              {videoSections.map((section) => {
                const isExpanded = expandedVideoSection === section._id;
                const lessons = Array.isArray(section.lessons) ? section.lessons : [];
                return (
                  <Card key={section._id} hover={false} className="bg-light-card border border-border-subtle text-light-text shadow-sm">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setExpandedVideoSection(isExpanded ? null : section._id)}
                            className="h-10 w-10 rounded-2xl border border-border-subtle flex items-center justify-center bg-light-cardAlt"
                            aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
                          >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                          </button>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-light-textMuted">Module {section.order ?? videoSections.indexOf(section) + 1}</p>
                            <h3 className="text-2xl font-semibold">{section.title}</h3>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openVideoSectionModal(section)} icon={<FiEdit />}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVideoSection(section._id)}
                            icon={<FiTrash />}
                            className="text-red-500 border-red-600 hover:bg-red-500/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                        {isExpanded && (
                        <div className="border-t border-border-subtle pt-4 space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 text-light-textSecondary">
                              <FiPlayCircle />
                              <p className="text-lg italic font-semibold">Lessons</p>
                              <span className="text-xs uppercase tracking-widest text-light-textMuted">{lessons.length} clips</span>
                            </div>
                            <Button size="sm" onClick={() => openLessonModal(section._id)} icon={<FiPlus />}>
                              Add Lesson
                            </Button>
                          </div>

                          {lessons.length > 0 ? (
                            <div className="space-y-3">
                              {lessons.map((lesson: any) => (
                                <div key={lesson._id || lesson.title} className="p-4 rounded-2xl bg-light-cardAlt border border-border-subtle/70 flex flex-col gap-2">
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                      <p className="text-lg font-semibold">{lesson.title}</p>
                                      <p className="text-sm text-light-textSecondary">
                                        {lesson.duration ? formatDuration(Number(lesson.duration)) : 'Custom length'} • {lesson.isPreview ? 'Preview Lesson' : 'Premium Lesson'}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button variant="outline" size="sm" onClick={() => openLessonModal(section._id, lesson)} icon={<FiEdit />}>
                                        Edit
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteLesson(section._id, lesson._id)}
                                        icon={<FiTrash />}
                                        className="text-red-500 border-red-600 hover:bg-red-500/10"
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-light-textSecondary">{lesson.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl bg-light-cardAlt border border-dashed border-border-subtle text-sm text-light-textMuted">
                              No lessons in this module yet. Kick it off with “Add Lesson”.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card hover={false} className="bg-light-card border border-dashed border-border-subtle text-light-textSecondary">
              <p>No modules yet. Use “New Module” to create your first video path.</p>
            </Card>
          )}
        </div>
      ) : (
        <Card hover={false} className="bg-light-card border border-dashed border-border-subtle text-light-textSecondary">
          <p>Select a video course to curate its modules and lessons.</p>
        </Card>
      )}

      {/* Section Modal */}
      {isSectionModalOpen && (
        <SectionFormModal
          isOpen={isSectionModalOpen}
          section={editingSection}
          onSubmit={handleSectionSubmit}
          onClose={closeSectionModal}
        />
      )}

      {/* Problem Modal */}
      {isProblemModalOpen && (
        <ProblemFormModal
          isOpen={isProblemModalOpen}
          problem={editingProblem}
          sections={dsaSections}
          onSubmit={handleProblemSubmit}
          onClose={closeProblemModal}
        />
      )}

      {/* Video Section Modal */}
      {isVideoSectionModalOpen && (
        <VideoSectionFormModal
          isOpen={isVideoSectionModalOpen}
          section={editingVideoSection}
          onSubmit={handleVideoSectionSubmit}
          onClose={closeVideoSectionModal}
        />
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <LessonFormModal
          isOpen={isLessonModalOpen}
          lesson={editingLesson}
          sections={videoSections}
          sectionId={lessonSectionId}
          onSubmit={handleLessonSubmit}
          onClose={closeLessonModal}
        />
      )}
    </div>
  );
};

interface FormAccordionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const FormAccordion: React.FC<FormAccordionProps> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-light-border dark:border-gray-800 rounded-2xl bg-light-cardAlt dark:bg-gray-900 text-light-text dark:text-white">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-brand-primary/10 text-brand-primary dark:bg-indigo-500/20 dark:text-indigo-200">
            {icon}
          </div>
          <span className="text-lg italic font-semibold">{title}</span>
        </div>
        {isOpen ? <FiChevronDown /> : <FiChevronRight />}
      </button>
      {isOpen && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
};

// Video Section (Module) Form Modal
const VideoSectionFormModal: React.FC<{ section: any; onSubmit: (data: any) => void; onClose: () => void; isOpen: boolean }> = ({ section, onSubmit, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    order: section?.order || 0,
    description: section?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedStarter = formData.starterCode.map((entry: any) => ({
      ...entry,
      code: entry.visibleCode ?? entry.code ?? '',
    }));
    onSubmit({ ...formData, starterCode: normalizedStarter });
  };

  return (
    <Modal title={section ? 'Edit Module' : 'Add Module'} onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormAccordion title="Module Basics" icon={<FiLayers />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Module Title" name="title" value={formData.title} onChange={handleChange} required />
            <Input label="Display Order" name="order" type="number" value={formData.order} onChange={handleChange} />
          </div>
        </FormAccordion>

        <FormAccordion title="Narrative" icon={<FiInfo />} defaultOpen={!!formData.description}>
          <Textarea label="Module Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
        </FormAccordion>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Module</Button>
        </div>
      </form>
    </Modal>
  );
};

// Lesson Form Modal
const LessonFormModal: React.FC<{
  lesson: any;
  sections: any[];
  sectionId: string;
  onSubmit: (sectionId: string, data: any) => void;
  onClose: () => void;
  isOpen: boolean;
}> = ({ lesson, sections, sectionId, onSubmit, onClose, isOpen }) => {
  const [targetSectionId, setTargetSectionId] = useState(sectionId || lesson?.section || sections[0]?._id || '');
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    order: lesson?.order || 0,
    duration: lesson?.duration || 0,
    videoUrl: lesson?.videoUrl || '',
    description: lesson?.description || '',
    isPreview: lesson?.isPreview || false,
    resources: Array.isArray(lesson?.resources) ? lesson.resources : [],
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleResourceChange = (index: number, field: string, value: string) => {
    const updated = [...formData.resources];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, resources: updated });
  };

  const addResource = () => {
    setFormData({ ...formData, resources: [...formData.resources, { title: '', url: '', type: 'video' }] });
  };

  const removeResource = (index: number) => {
    const updated = [...formData.resources];
    updated.splice(index, 1);
    setFormData({ ...formData, resources: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(targetSectionId, formData);
  };

  return (
    <Modal title={lesson?._id ? 'Edit Lesson' : 'Add Lesson'} onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormAccordion title="Lesson Routing" icon={<FiVideo />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Module" name="lesson-section" value={targetSectionId} onChange={(e) => setTargetSectionId(e.target.value)} required>
              <option value="">-- Select Module --</option>
              {sections.map(section => (
                <option key={section._id} value={section._id}>{section.title}</option>
              ))}
            </Select>
            <Input label="Display Order" name="order" type="number" value={formData.order} onChange={handleChange} />
          </div>
        </FormAccordion>

        <FormAccordion title="Lesson Details" icon={<FiPlayCircle />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Lesson Title" name="title" value={formData.title} onChange={handleChange} required />
            <Input label="Duration (minutes)" name="duration" type="number" value={formData.duration} onChange={handleChange} />
            <Input label="Video URL" name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="https://" />
          </div>
          <Textarea label="Lesson Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
          <label className="flex items-center gap-2 text-sm text-light-textSecondary">
            <input type="checkbox" name="isPreview" checked={formData.isPreview} onChange={handleChange} className="w-4 h-4" />
            Make this lesson a free preview
          </label>
        </FormAccordion>

        <FormAccordion title="Resources" icon={<FiTarget />} defaultOpen={formData.resources.length > 0}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-light-textSecondary">Attach slides, source code, or companion links.</p>
            <Button type="button" size="sm" icon={<FiPlus />} onClick={addResource}>Add Resource</Button>
          </div>
          {formData.resources.length === 0 && (
            <p className="text-sm text-light-textMuted">No resources yet. Use “Add Resource” to link supporting assets.</p>
          )}
          {formData.resources.map((resource: any, index: number) => (
            <div key={index} className="mb-3 p-4 rounded-2xl bg-light-cardAlt border border-border-subtle space-y-3">
              <div className="flex justify-between items-center text-sm text-light-textSecondary">
                <span>Resource {index + 1}</span>
                <button type="button" onClick={() => removeResource(index)} className="text-red-500">Remove</button>
              </div>
              <Input label="Title" name={`resource-${index}-title`} value={resource.title} onChange={(e) => handleResourceChange(index, 'title', e.target.value)} />
              <Input label="URL" name={`resource-${index}-url`} value={resource.url} onChange={(e) => handleResourceChange(index, 'url', e.target.value)} placeholder="https://" />
              <Select label="Type" name={`resource-${index}-type`} value={resource.type || 'video'} onChange={(e) => handleResourceChange(index, 'type', e.target.value)}>
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="code">Code</option>
                <option value="link">Link</option>
              </Select>
            </div>
          ))}
        </FormAccordion>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Lesson</Button>
        </div>
      </form>
    </Modal>
  );
};

// Section Form Modal Component
const SectionFormModal: React.FC<{ section: any, onSubmit: (data: any) => void, onClose: () => void, isOpen: boolean }> = ({ section, onSubmit, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    order: section?.order || 0,
    description: section?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal title={section ? 'Edit Section' : 'Add Section'} onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormAccordion title="Section Essentials" icon={<FiBookOpen />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Section Title" name="title" value={formData.title} onChange={handleChange} required />
            <Input label="Display Order" name="order" type="number" value={formData.order} onChange={handleChange} />
          </div>
        </FormAccordion>

        <FormAccordion title="Narrative" icon={<FiInfo />} defaultOpen={!!formData.description}>
          <Textarea label="Section Description" name="description" value={formData.description} onChange={handleChange} rows={4} />
        </FormAccordion>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Section</Button>
        </div>
      </form>
    </Modal>
  );
};

// Problem Form Modal Component
const normalizeStarterCode = (starterCode: any[] = []) => {
  if (!starterCode.length) {
    return [
      { language: 'javascript', visibleCode: 'function solve(...args) {\n  return "";\n}', adapterCode: '' },
      { language: 'python', visibleCode: 'def solve(*args):\n    return ""', adapterCode: '' }
    ];
  }
  return starterCode.map(entry => ({
    language: entry.language || 'javascript',
    visibleCode: entry.visibleCode ?? entry.code ?? '',
    adapterCode: entry.adapterCode ?? '',
  }));
};

const ProblemFormModal: React.FC<{ problem: any, sections: any[], onSubmit: (data: any) => void, onClose: () => void, isOpen: boolean }> = ({ problem, sections, onSubmit, onClose, isOpen }) => {
  const [formData, setFormData] = useState({
    title: problem?.title || '',
    section: problem?.section || '',
    order: problem?.order || 0,
    difficulty: problem?.difficulty || 'Easy',
    description: problem?.description || '',
    leetcodeLink: problem?.leetcodeLink || '',
    isFree: problem?.isFree || false,
    constraints: problem?.constraints || [],
    hints: problem?.hints || [],
    examples: problem?.examples || [],
    starterCode: normalizeStarterCode(problem?.starterCode),
    testCases: problem?.testCases || []
  });

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    const newArray = [...(formData as any)[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: string, defaultValue: any) => {
    setFormData({ ...formData, [field]: [...(formData as any)[field], defaultValue] });
  };

  const removeArrayItem = (field: string, index: number) => {
    const newArray = [...(formData as any)[field]];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleStarterCodeFieldChange = (index: number, field: 'language' | 'visibleCode' | 'adapterCode', value: string) => {
    const newStarterCode = [...formData.starterCode];
    newStarterCode[index] = {
      ...newStarterCode[index],
      [field]: value,
    };
    setFormData({ ...formData, starterCode: newStarterCode });
  };

  const handleInsertAdapterTemplate = (index: number) => {
    const entry = formData.starterCode[index];
    if (!entry) return;
    const snippet = ADAPTER_SNIPPETS[entry.language];
    if (!snippet) return;
    handleStarterCodeFieldChange(index, 'adapterCode', snippet);
  };

  const handleTestCaseChange = (index: number, field: string, value: any) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleExampleChange = (index: number, field: string, value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setFormData({ ...formData, examples: newExamples });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal title={problem?._id ? 'Edit Problem' : 'Add Problem'} onClose={onClose} isOpen={isOpen}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-2 text-light-text">
        <FormAccordion title="Problem Brief" icon={<FiBookOpen />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Problem Title" name="title" value={formData.title} onChange={handleChange} required />
            <Select label="Section" name="section" value={formData.section} onChange={handleChange} required>
              <option value="">-- Select Section --</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.title}</option>)}
            </Select>
            <Input label="Ordering Weight" name="order" type="number" value={formData.order} onChange={handleChange} />
            <Select label="Difficulty" name="difficulty" value={formData.difficulty} onChange={handleChange}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" name="isFree" id="problem-isFree" checked={formData.isFree} onChange={handleChange} className="w-4 h-4" />
            <label htmlFor="problem-isFree" className="text-sm text-light-textSecondary">Mark as a free preview problem</label>
          </div>
        </FormAccordion>

        <FormAccordion title="Problem Statement" icon={<FiInfo />}>
          <Textarea label="Description (Markdown supported)" name="description" value={formData.description} onChange={handleChange} rows={6} required />
          <Input label="LeetCode Link (Optional)" name="leetcodeLink" value={formData.leetcodeLink} onChange={handleChange} />
        </FormAccordion>

        <FormAccordion title="Examples" icon={<FiList />}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-light-textSecondary">Illustrate the expected flow with curated scenarios.</p>
            <Button
              type="button"
              size="sm"
              icon={<FiPlus />}
              onClick={() => addArrayItem('examples', { input: '', output: '', explanation: '' })}
            >
              Add Example
            </Button>
          </div>
          {formData.examples.map((ex: any, i: number) => (
            <div key={i} className="mb-3 p-4 rounded-2xl bg-light-cardAlt border border-border-subtle space-y-3">
              <div className="flex justify-between">
                <span className="text-sm uppercase tracking-widest text-light-textMuted">Example {i + 1}</span>
                <button type="button" onClick={() => removeArrayItem('examples', i)} className="text-red-500 text-sm">Remove</button>
              </div>
              <Input label="Input" name={`example-${i}-input`} value={ex.input} onChange={(e) => handleExampleChange(i, 'input', e.target.value)} />
              <Input label="Output" name={`example-${i}-output`} value={ex.output} onChange={(e) => handleExampleChange(i, 'output', e.target.value)} />
              <Textarea label="Explanation" name={`example-${i}-explanation`} value={ex.explanation} onChange={(e) => handleExampleChange(i, 'explanation', e.target.value)} rows={2} />
            </div>
          ))}
        </FormAccordion>

        <FormAccordion title="Constraints & Hints" icon={<FiSettings />}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-light-textSecondary">Boundary conditions for the evaluator.</p>
                <Button
                  type="button"
                  size="sm"
                  icon={<FiPlus />}
                  onClick={() => addArrayItem('constraints', '')}
                >
                  Add Constraint
                </Button>
              </div>
              {formData.constraints.map((constraint: string, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <Input
                    label={`Constraint ${i + 1}`}
                    name={`constraint-${i}`}
                    value={constraint}
                    onChange={(e) => handleArrayChange('constraints', i, e.target.value)}
                    className="flex-1"
                  />
                  <button type="button" onClick={() => removeArrayItem('constraints', i)} className="text-red-400 px-2">×</button>
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-light-textSecondary">Layer hints for guided problem solving.</p>
                <Button
                  type="button"
                  size="sm"
                  icon={<FiPlus />}
                  onClick={() => addArrayItem('hints', '')}
                >
                  Add Hint
                </Button>
              </div>
              {formData.hints.map((hint: string, i: number) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <Textarea
                    label={`Hint ${i + 1}`}
                    name={`hint-${i}`}
                    value={hint}
                    onChange={(e) => handleArrayChange('hints', i, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <button type="button" onClick={() => removeArrayItem('hints', i)} className="text-red-400 px-2">×</button>
                </div>
              ))}
            </div>
          </div>
        </FormAccordion>

        <FormAccordion title="Starter Code" icon={<FiCode />}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-light-textSecondary">Provide language templates to match your IDE-ready experience.</p>
            <Button
              type="button"
              size="sm"
              icon={<FiPlus />}
              onClick={() => addArrayItem('starterCode', { language: 'javascript', visibleCode: '', adapterCode: '' })}
            >
              Add Language
            </Button>
          </div>
          <div className="mb-4 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-sm text-indigo-900 dark:bg-dark-cardAlt dark:border-indigo-500/40 dark:text-indigo-100">
            <p className="font-semibold mb-2">Harness contract</p>
            <p className="mb-3">Each starter snippet must export <span className="font-mono">solve</span> with the language-specific signature below. Our compiler wraps submissions and calls this function directly&mdash;no <code>main</code>, no STDIN parsing.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {Object.entries(LANGUAGE_SIGNATURES).map(([lang, signature]) => (
                <div key={lang} className="px-3 py-2 rounded-xl bg-white/70 dark:bg-dark-card border border-white/60 dark:border-dark-border flex items-center justify-between text-xs font-semibold">
                  <span className="uppercase tracking-widest text-light-textMuted dark:text-dark-muted">{lang}</span>
                  <span className="font-mono text-[11px] text-light-text dark:text-dark-text">{signature}</span>
                </div>
              ))}
            </div>
          </div>
          {formData.starterCode.map((sc: any, i: number) => (
            <div key={i} className="mb-3 p-4 rounded-2xl bg-light-cardAlt border border-border-subtle space-y-3">
              <div className="flex justify-between gap-3 flex-wrap">
                <div className="w-48">
                  <Select
                    label={`Language ${i + 1}`}
                    name={`starterCode-${i}-language`}
                    value={sc.language}
                    onChange={(e) => handleStarterCodeFieldChange(i, 'language', e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </Select>
                </div>
                <button type="button" onClick={() => removeArrayItem('starterCode', i)} className="text-red-500 text-sm">Remove</button>
              </div>
              <p className="text-xs text-light-textSecondary dark:text-dark-muted -mt-1">Signature required behind the scenes: <span className="font-mono text-light-text dark:text-dark-text">{LANGUAGE_SIGNATURES[sc.language] || 'solve(...)'}</span></p>
              <Textarea
                label="Student Stub (visible)"
                name={`starterCode-${i}-visible`}
                value={sc.visibleCode ?? ''}
                onChange={(e) => handleStarterCodeFieldChange(i, 'visibleCode', e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <Textarea
                label="Adapter / Harness Bridge (hidden)"
                name={`starterCode-${i}-adapter`}
                value={sc.adapterCode ?? ''}
                onChange={(e) => handleStarterCodeFieldChange(i, 'adapterCode', e.target.value)}
                rows={4}
                className="font-mono text-xs bg-dark-card/5"
                placeholder="Expose __doflow_entry(...) here; parse args and call the student stub."
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInsertAdapterTemplate(i)}
                  disabled={!ADAPTER_SNIPPETS[sc.language]}
                >
                  Insert adapter template
                </Button>
              </div>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-muted">
                Need a starting point? See <code>ADAPTER_TEMPLATES.md</code> for ready-made entrypoints that implement <code>__doflow_entry</code> for each language.
              </p>
            </div>
          ))}
        </FormAccordion>

        <FormAccordion title="Test Cases" icon={<FiTarget />}>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-light-textSecondary">Curate public and hidden cases for automated judging.</p>
            <Button
              type="button"
              size="sm"
              icon={<FiPlus />}
              onClick={() => addArrayItem('testCases', { input: '', expectedOutput: '', isHidden: false })}
            >
              Add Test Case
            </Button>
          </div>
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900 dark:bg-dark-cardAlt dark:border-amber-500/40 dark:text-amber-100">
            <p className="font-semibold mb-2">Input formatting tips</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use JSON arrays for clarity: <code className="font-mono">[[2,7,11,15], 9]</code>.</li>
              <li>Legacy <code>name = value</code> pairs (e.g. <code>nums = [...], target = 9</code>) still work; we convert them automatically.</li>
              <li>Expected outputs must match exactly what <code>solve</code> returns (whitespace-sensitive).</li>
            </ul>
          </div>
          {formData.testCases.map((tc: any, i: number) => {
            const preview = describeTestCasePreview(tc.input);
            const toneClasses: Record<string, string> = {
              success: 'text-green-600',
              warning: 'text-amber-600',
              muted: 'text-light-textSecondary dark:text-dark-muted',
            };
            return (
              <div key={i} className="mb-3 p-4 rounded-2xl bg-light-cardAlt border border-border-subtle space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm uppercase tracking-widest text-light-textMuted">Test Case {i + 1}</span>
                  <button type="button" onClick={() => removeArrayItem('testCases', i)} className="text-red-500 text-sm">Remove</button>
                </div>
                <Input label="Input" name={`testcase-${i}-input`} value={tc.input} onChange={(e) => handleTestCaseChange(i, 'input', e.target.value)} />
                <p className={`text-xs ${toneClasses[preview.tone] || 'text-light-textSecondary'}`}>
                  {preview.message}
                </p>
                <Input label="Expected Output" name={`testcase-${i}-output`} value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(i, 'expectedOutput', e.target.value)} />
                <p className="text-xs text-light-textSecondary dark:text-dark-muted -mt-2">Judge0 compares literal strings—format arrays, decimals, and spacing exactly as your solution returns.</p>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`testcase-${i}-hidden`} checked={tc.isHidden} onChange={(e) => handleTestCaseChange(i, 'isHidden', e.target.checked)} className="w-4 h-4" />
                  <label htmlFor={`testcase-${i}-hidden`} className="text-sm text-light-textSecondary">Hidden test case (not visible to students)</label>
                </div>
              </div>
            );
          })}
        </FormAccordion>

        <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-light-card py-3 border-t border-border-subtle">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Problem</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ManageDSACoursePage;
