import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get public platform stats
// @route   GET /api/public/stats
// @access  Public
export const getPlatformStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    
    // Calculate completion rate
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ progress: 100 });
    const successRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;

    res.json({
      totalStudents,
      totalCourses,
      totalInstructors,
      successRate
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
