import Progress from '../models/Progress.js';

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
  const progressRecords = await Progress.find({
    user: userId,
    course: courseId
  }).lean();

  if (progressRecords.length === 0) {
    return {
      courseId: courseId.toString(),
      totalLessons: 0,
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

  // Get total lessons count from the course (we'll need to fetch this)
  const totalLessons = progressRecords.length; // This counts lessons the user has started
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
