import Problem from '../models/Problem.js';
import CodeSubmission from '../models/CodeSubmission.js';

const normalizeId = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    return value;
  }
  if (value.toString) {
    return value.toString();
  }
  return null;
};

export const buildDsaProgressSnapshot = async (userId, courseId) => {
  const normalizedCourseId = normalizeId(courseId);
  if (!userId || !normalizedCourseId) {
    return null;
  }

  const totalProblems = await Problem.countDocuments({ course: normalizedCourseId });

  if (totalProblems === 0) {
    return {
      courseId: normalizedCourseId,
      totalProblems: 0,
      solvedProblems: 0,
      percentage: 0,
      solvedProblemIds: [],
    };
  }

  const acceptedProblemIds = await CodeSubmission.distinct('problem', {
    user: userId,
    status: 'accepted'
  });

  if (!acceptedProblemIds.length) {
    return {
      courseId: normalizedCourseId,
      totalProblems,
      solvedProblems: 0,
      percentage: 0,
      solvedProblemIds: [],
    };
  }

  const solvedProblems = await Problem.find({
    _id: { $in: acceptedProblemIds },
    course: normalizedCourseId
  }).select('_id');

  const solvedProblemIds = solvedProblems.map(problem => problem._id.toString());
  const solvedCount = solvedProblemIds.length;
  const percentage = Math.min(100, Math.round((solvedCount / totalProblems) * 100));

  return {
    courseId: normalizedCourseId,
    totalProblems,
    solvedProblems: solvedCount,
    percentage,
    solvedProblemIds,
  };
};
