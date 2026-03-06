import express from 'express';
import {
  getDashboardStats,
  getRevenueAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  toggleCoursePublish,
  getAllReviews,
  toggleReviewApproval
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import Course from '../models/Course.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/revenue-analytics', getRevenueAnalytics);

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/courses', getAllCourses);
router.put('/courses/:id/publish', toggleCoursePublish);

router.get('/reviews', getAllReviews);
router.put('/reviews/:id/approve', toggleReviewApproval);

// ===== Python Course Admin Endpoints =====

// GET: Fetch all lessons for a course with stats
router.get('/python-course/lessons', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const lessons = [];
    course.sections.forEach((section, secIdx) => {
      section.lessons.forEach((lesson, lesIdx) => {
        lessons.push({
          _id: lesson._id,
          sectionIndex: secIdx,
          lessonIndex: lesIdx,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          quizCount: lesson.quiz?.questions?.length || 0,
          interviewCount: lesson.interview?.questions?.length || 0,
          contentLength: (lesson.content || '').length,
          isPreview: lesson.isPreview
        });
      });
    });

    res.json({
      courseTitle: course.title,
      totalLessons: lessons.length,
      lessons
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch a single lesson details
router.get('/python-course/lessons/:sectionIdx/:lessonIdx', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const secIdx = parseInt(req.params.sectionIdx);
    const lesIdx = parseInt(req.params.lessonIdx);

    if (secIdx < 0 || secIdx >= course.sections.length) {
      return res.status(404).json({ error: 'Section not found' });
    }
    if (lesIdx < 0 || lesIdx >= course.sections[secIdx].lessons.length) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = course.sections[secIdx].lessons[lesIdx];
    res.json({
      _id: lesson._id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      quiz: lesson.quiz,
      interview: lesson.interview,
      isPreview: lesson.isPreview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Update lesson
router.put('/python-course/lessons/:sectionIdx/:lessonIdx', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const secIdx = parseInt(req.params.sectionIdx);
    const lesIdx = parseInt(req.params.lessonIdx);

    if (secIdx < 0 || secIdx >= course.sections.length || lesIdx < 0 || lesIdx >= course.sections[secIdx].lessons.length) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = course.sections[secIdx].lessons[lesIdx];
    const { title, description, content, duration, quiz, interview, isPreview } = req.body;

    if (title) lesson.title = title;
    if (description) lesson.description = description;
    if (content !== undefined) lesson.content = content;
    if (duration) lesson.duration = duration;
    if (quiz) lesson.quiz = quiz;
    if (interview) lesson.interview = interview;
    if (isPreview !== undefined) lesson.isPreview = isPreview;

    await course.save();
    res.json({ success: true, message: 'Lesson updated', lesson: { title: lesson.title, sectionIndex: secIdx, lessonIndex: lesIdx } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch course stats
router.get('/python-course/stats', async (req, res) => {
  try {
    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    let totalQuizzes = 0;
    let totalInterviews = 0;
    let lessonsWithQuiz = 0;
    let lessonsWithInterview = 0;
    let totalContent = 0;

    course.sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        if (lesson.quiz && Array.isArray(lesson.quiz.questions) && lesson.quiz.questions.length > 0) {
          totalQuizzes += lesson.quiz.questions.length;
          lessonsWithQuiz++;
        }
        if (lesson.interview && Array.isArray(lesson.interview.questions) && lesson.interview.questions.length > 0) {
          totalInterviews += lesson.interview.questions.length;
          lessonsWithInterview++;
        }
        if (lesson.content) totalContent += lesson.content.length;
      });
    });

    res.json({
      courseTitle: course.title,
      totalLessons: course.totalLessons,
      totalDuration: course.totalDuration,
      lessonsWithQuiz,
      lessonsWithInterview,
      totalQuizzes,
      totalInterviews,
      totalContentCharacters: totalContent,
      averageContentPerLesson: course.totalLessons > 0 ? Math.round(totalContent / course.totalLessons) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
