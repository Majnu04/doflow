import express from 'express';
import { updateProgress, getCourseProgress, getAllProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, updateProgress);
router.get('/', protect, getAllProgress);
router.get('/:courseId', protect, getCourseProgress);

export default router;
