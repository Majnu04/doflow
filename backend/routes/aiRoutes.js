import express from 'express';
import { postAnswerFeedback, postComplexityInsights, postDoubtChat, postLessonChat } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/complexity', protect, postComplexityInsights);
router.post('/doubt', protect, postDoubtChat);
router.post('/evaluate-answer', protect, postAnswerFeedback);
router.post('/lesson-chat', protect, postLessonChat);

export default router;
