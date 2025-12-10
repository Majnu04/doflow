import Progress from '../models/Progress.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { buildVideoCourseProgress } from '../utils/videoCourseProgress.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

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
          
          // Auto-generate certificate when course is completed
          try {
            const existingCert = await Certificate.findOne({ userId: req.user._id, courseId });
            if (!existingCert) {
              const course = await Course.findById(courseId);
              const user = await User.findById(req.user._id);
              
              if (course && user) {
                const certificateId = `DOFLOW-${uuidv4().split('-')[0].toUpperCase()}`;
                const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/certificate/verify/${certificateId}`;
                
                await Certificate.create({
                  userId: req.user._id,
                  courseId,
                  certificateId,
                  studentName: user.name,
                  courseName: course.title,
                  completionDate: new Date(),
                  verificationUrl,
                });
                
                enrollment.certificateIssued = true;
                enrollment.certificateIssuedAt = new Date();
                
                logger.info('Certificate auto-generated on course completion', { 
                  userId: req.user._id, 
                  courseId, 
                  certificateId 
                });
              }
            } else {
              enrollment.certificateIssued = true;
            }
          } catch (certError) {
            logger.error('Failed to auto-generate certificate', { error: certError.message });
          }
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
