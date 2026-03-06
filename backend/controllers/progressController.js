import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { buildVideoCourseProgress } from '../utils/videoCourseProgress.js';
import logger from '../utils/logger.js';

// @desc    Update lesson progress
// @route   POST /api/progress
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, watchTime, isCompleted } = req.body;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      'paymentInfo.status': 'completed'
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to track progress' });
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
      lesson: lessonId
    });

    if (progress) {
      progress.watchTime = watchTime || progress.watchTime;
      progress.isCompleted = isCompleted !== undefined ? isCompleted : progress.isCompleted;
      progress.lastWatched = new Date();
      await progress.save();
    } else {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
        lesson: lessonId,
        watchTime: watchTime || 0,
        isCompleted: isCompleted || false
      });
    }

    // Update enrollment progress using centralized utility
    if (isCompleted) {
      if (!enrollment.completedLessons.find(l => l.lessonId.toString() === lessonId)) {
        enrollment.completedLessons.push({ lessonId });
      }
      enrollment.lastAccessedLesson = lessonId;

      // Use buildVideoCourseProgress for accurate calculation
      const courseProgress = await buildVideoCourseProgress(req.user._id, courseId);
      
      if (courseProgress) {
        enrollment.progress = courseProgress.percentage;

        // Check if course is completed
        if (enrollment.progress === 100 && !enrollment.completedAt) {
          enrollment.completedAt = new Date();
        }

        await enrollment.save();
        logger.info('Video course progress updated', { 
          userId: req.user._id, 
          courseId, 
          progress: courseProgress.percentage 
        });
      }
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course progress
// @route   GET /api/progress/:courseId
// @access  Private
export const getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      user: req.user._id,
      course: req.params.courseId
    });

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
      'paymentInfo.status': 'completed'
    });

    res.json({
      progress,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user progress
// @route   GET /api/progress
// @access  Private
export const getAllProgress = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
      'paymentInfo.status': 'completed'
    }).populate('course', 'title thumbnail totalLessons');

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
