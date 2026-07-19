import Progress from '../models/Progress.js';
import Course from '../models/Course.js';

/**
 * Calculate video course progress for a user
 * @param {string} userId - User's MongoDB ObjectId
 * @param {string} courseId - Course's MongoDB ObjectId
 * @returns {Promise<{courseId: string, totalLessons: number, completedLessons: number, percentage: number, completedLessonIds: string[]}>}
 */
export const buildVideoCourseProgress = async (userId, courseId) => {
  if (!userId || !courseId) {
    return null;
  }

  // Fetch all progress records for this user and course
  const [progressRecords, course] = await Promise.all([
    Progress.find({ user: userId, course: courseId }).lean(),
    Course.findById(courseId).select('totalLessons').lean()
  ]);

  // Get actual total lesson count from the course document
  const totalLessons = course?.totalLessons || 0;

  if (progressRecords.length === 0 || totalLessons === 0) {
    return {
      courseId: courseId.toString(),
      totalLessons,
      completedLessons: 0,
      percentage: 0,
      completedLessonIds: [],
      totalWatchTime: 0
    };
  }

  // Calculate completed lessons
  const completedLessons = progressRecords.filter(record => record.isCompleted);
  const completedLessonIds = completedLessons.map(record => record.lesson.toString());

  // Calculate total watch time (in seconds)
  const totalWatchTime = progressRecords.reduce((sum, record) => sum + (record.watchTime || 0), 0);

  // Use actual total lesson count from course, not just started lessons
  const percentage = totalLessons > 0 
    ? Math.min(100, Math.round((completedLessons.length / totalLessons) * 100))
    : 0;

  return {
    courseId: courseId.toString(),
    totalLessons,
    completedLessons: completedLessons.length,
    percentage,
    completedLessonIds,
    totalWatchTime
  };
};
