import express from 'express';
import {
  getProblemDiscussions,
  createDiscussion,
  addReply,
  likeDiscussion,
  markAsSolved,
  deleteDiscussion
} from '../controllers/discussionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/problem/:problemId', getProblemDiscussions);
router.post('/', protect, createDiscussion);
router.post('/:id/replies', protect, addReply);
router.put('/:id/like', protect, likeDiscussion);
router.put('/:id/solve', protect, markAsSolved);
router.delete('/:id', protect, deleteDiscussion);

export default router;
