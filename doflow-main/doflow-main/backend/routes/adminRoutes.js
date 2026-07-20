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

export default router;
