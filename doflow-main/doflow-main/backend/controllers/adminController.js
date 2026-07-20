import mongoose from 'mongoose';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments({ 'paymentInfo.status': 'completed' });
    
    // Calculate total revenue
    const revenueData = await Enrollment.aggregate([
      { $match: { 'paymentInfo.status': 'completed' } },
      { $group: { _id: null, total: { $sum: '$paymentInfo.amount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get monthly revenue
    const monthlyRevenue = await Enrollment.aggregate([
      { $match: { 'paymentInfo.status': 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$paymentInfo.amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Get popular courses
    const popularCourses = await Course.find()
      .sort({ enrollmentCount: -1 })
      .limit(5)
      .select('title enrollmentCount ratings');

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({ 'paymentInfo.status': 'completed' })
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent users
    const recentUsers = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt');

    // Get recent courses
    const recentCourses = await Course.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title category price enrollmentCount createdAt');

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        monthlyRevenue,
        popularCourses,
        recentEnrollments
      },
      recentUsers,
      recentCourses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue analytics with filters
// @route   GET /api/admin/revenue-analytics
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const parsedYear = Number(req.query.year) || now.getFullYear();
    const parsedMonth = req.query.month ? Number(req.query.month) : null;
    const courseId = req.query.courseId;

    if (parsedMonth && (parsedMonth < 1 || parsedMonth > 12)) {
      return res.status(400).json({ message: 'Month must be between 1 and 12.' });
    }

    let courseObjectId = null;
    if (courseId) {
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid courseId provided.' });
      }
      courseObjectId = new mongoose.Types.ObjectId(courseId);
    }

    const rangeStart = parsedMonth ? new Date(parsedYear, parsedMonth - 1, 1) : new Date(parsedYear, 0, 1);
    const rangeEnd = parsedMonth ? new Date(parsedYear, parsedMonth, 1) : new Date(parsedYear + 1, 0, 1);

    const baseMatch = {
      'paymentInfo.status': 'completed',
      createdAt: { $gte: rangeStart, $lt: rangeEnd }
    };

    if (courseObjectId) {
      baseMatch.course = courseObjectId;
    }

    const monthlyMatch = {
      'paymentInfo.status': 'completed',
      createdAt: {
        $gte: new Date(parsedYear, 0, 1),
        $lt: new Date(parsedYear + 1, 0, 1)
      }
    };

    if (courseObjectId) {
      monthlyMatch.course = courseObjectId;
    }

    const [summaryAggregation, monthlyAggregation, courseAggregation, availableYearAggregation, courseOptions] = await Promise.all([
      Enrollment.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$paymentInfo.amount' },
            enrollments: { $sum: 1 }
          }
        }
      ]),
      Enrollment.aggregate([
        { $match: monthlyMatch },
        {
          $group: {
            _id: { month: { $month: '$createdAt' } },
            revenue: { $sum: '$paymentInfo.amount' },
            enrollments: { $sum: 1 }
          }
        }
      ]),
      Enrollment.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$course',
            revenue: { $sum: '$paymentInfo.amount' },
            enrollments: { $sum: 1 }
          }
        },
        { $sort: { revenue: -1 } }
      ]),
      Enrollment.aggregate([
        { $match: { 'paymentInfo.status': 'completed' } },
        {
          $group: {
            _id: { $year: '$createdAt' }
          }
        },
        { $sort: { '_id': -1 } }
      ]),
      Course.find().select('title').sort({ title: 1 }).lean()
    ]);

    const courseTitleMap = courseOptions.reduce((acc, course) => {
      acc[course._id.toString()] = course.title;
      return acc;
    }, {});

    if (courseId && !courseTitleMap[courseId]) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const summaryTotals = summaryAggregation[0] || { revenue: 0, enrollments: 0 };
    const summary = {
      totalRevenue: summaryTotals.revenue || 0,
      totalEnrollments: summaryTotals.enrollments || 0,
      averageOrderValue:
        summaryTotals.enrollments > 0
          ? summaryTotals.revenue / summaryTotals.enrollments
          : 0
    };

    const monthlyMap = monthlyAggregation.reduce((acc, item) => {
      acc[item._id.month] = {
        revenue: item.revenue,
        enrollments: item.enrollments
      };
      return acc;
    }, {});

    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
      const monthNumber = index + 1;
      const entry = monthlyMap[monthNumber] || { revenue: 0, enrollments: 0 };
      return {
        month: monthNumber,
        label: MONTH_LABELS[index],
        year: parsedYear,
        revenue: entry.revenue,
        enrollments: entry.enrollments
      };
    });

    const courseRevenue = courseAggregation.map((record) => ({
      courseId: record._id ? record._id.toString() : null,
      courseTitle: record._id ? courseTitleMap[record._id.toString()] || 'Unknown Course' : 'Unknown Course',
      revenue: record.revenue,
      enrollments: record.enrollments
    }));

    const availableYears = availableYearAggregation
      .map((entry) => entry._id)
      .filter(Boolean);

    if (!availableYears.includes(parsedYear)) {
      availableYears.push(parsedYear);
    }

    availableYears.sort((a, b) => b - a);

    res.json({
      summary,
      monthlyRevenue,
      courseRevenue,
      availableFilters: {
        years: availableYears,
        courses: courseOptions.map((course) => ({
          _id: course._id.toString(),
          title: course.title
        }))
      },
      appliedFilters: {
        year: parsedYear,
        month: parsedMonth,
        courseId: courseId || null
      }
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
// @access  Private/Admin
export const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle course publish status
// @route   PUT /api/admin/courses/:id/publish
// @access  Private/Admin
export const toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments();

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle review approval
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
export const toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
