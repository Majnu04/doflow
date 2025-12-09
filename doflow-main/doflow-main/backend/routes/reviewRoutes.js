import express from 'express';
import {
  createReview,
  getCourseReviews,
  updateReview,
  deleteReview,
  likeReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/course/:courseId', getCourseReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/like', protect, likeReview);

export default router;
