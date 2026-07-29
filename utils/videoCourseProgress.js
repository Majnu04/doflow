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

  // Fetch the actual course to get the real total lesson count
  const course = await Course.findById(courseId).lean();
  if (!course) {
    return null;
  }

  // Count actual total lessons from course sections
  const totalLessons = (course.sections || []).reduce(
    (sum, section) => sum + (section.lessons?.length || 0), 0
  );

  if (totalLessons === 0) {
    return {
      courseId: courseId.toString(),
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
      completedLessonIds: [],
      totalWatchTime: 0
    };
  }

  // Fetch all progress records for this user and course
  const progressRecords = await Progress.find({
    user: userId,
    course: courseId
  }).lean();

  // Calculate completed lessons
  const completedLessons = progressRecords.filter(record => record.isCompleted);
  const completedLessonIds = completedLessons.map(record => record.lesson.toString());
  
  // Calculate total watch time (in seconds)
  const totalWatchTime = progressRecords.reduce((sum, record) => sum + (record.watchTime || 0), 0);

  const percentage = Math.min(100, Math.round((completedLessons.length / totalLessons) * 100));

  return {
    courseId: courseId.toString(),
    totalLessons,
    completedLessons: completedLessons.length,
    percentage,
    completedLessonIds,
    totalWatchTime
  };
};
