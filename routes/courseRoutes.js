import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeaturedCourses,
  checkEnrollment
} from '../controllers/courseController.js';
import { protect, instructor, admin } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, instructor, createCourse);

router.get('/featured', getFeaturedCourses);

router.route('/:id')
  .get(getCourse)
  .put(protect, instructor, updateCourse)
  .delete(protect, admin, deleteCourse);

router.get('/:id/check-enrollment', protect, checkEnrollment);

export default router;
