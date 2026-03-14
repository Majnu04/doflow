import express from 'express';
import {
  getBookmarks,
  checkBookmark,
  toggleBookmark,
  deleteBookmark
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getBookmarks);
router.get('/check/:problemId', protect, checkBookmark);
router.post('/toggle', protect, toggleBookmark);
router.delete('/:id', protect, deleteBookmark);

export default router;
