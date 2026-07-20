import express from 'express';
import {
  getNotes,
  getProblemNote,
  createOrUpdateNote,
  deleteNote
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getNotes);
router.get('/problem/:problemId', protect, getProblemNote);
router.post('/', protect, createOrUpdateNote);
router.delete('/:id', protect, deleteNote);

export default router;
