import express from 'express';
import { postAnswerFeedback, postComplexityInsights, postDoubtChat, postLessonChat } from '../controllers/aiController.js';

const router = express.Router();

router.post('/complexity', postComplexityInsights);
router.post('/doubt', postDoubtChat);
router.post('/evaluate-answer', postAnswerFeedback);
router.post('/lesson-chat', postLessonChat);

export default router;
