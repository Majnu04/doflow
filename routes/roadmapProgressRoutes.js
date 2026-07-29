import express from 'express';
import {
  getUserProgress,
  updateProblemStatus,
  getAllProgress
} from '../controllers/roadmapProgressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllProgress);
router.get('/:roadmapId', protect, getUserProgress);
router.put('/:roadmapId/problems/:problemId', protect, updateProblemStatus);

export default router;
