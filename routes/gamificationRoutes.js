import express from 'express';
import {
  getGamificationData,
  recordLessonCompleted,
  recordProblemSolved,
  recordStudyTime,
  getLeaderboard,
} from '../controllers/gamificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All gamification routes require authentication
router.use(protect);

router.get('/me', getGamificationData);
router.get('/leaderboard', getLeaderboard);
router.post('/lesson-completed', recordLessonCompleted);
router.post('/problem-solved', recordProblemSolved);
router.post('/study-time', recordStudyTime);

export default router;
