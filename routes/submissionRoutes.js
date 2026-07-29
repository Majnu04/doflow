import express from 'express';
import {
  runCode,
  submitCode,
  getProblemSubmissions,
  getAllSubmissions
} from '../controllers/submissionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/run', runCode); // No authentication required for running code
router.post('/submit', protect, submitCode);
router.get('/problem/:problemId', protect, getProblemSubmissions);
router.get('/', protect, getAllSubmissions);

export default router;
