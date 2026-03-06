import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  createSection,
  getSections,
  updateSection,
  deleteSection,
  createProblem,
  getProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  getCourseProgress,
} from '../controllers/dsaController.js';

const router = express.Router();

// Section Routes
router.route('/sections')
  .post(protect, admin, createSection)
  .get(getSections);

router.route('/sections/:id')
  .put(protect, admin, updateSection)
  .delete(protect, admin, deleteSection);

// Problem Routes
router.route('/problems')
  .post(protect, admin, createProblem)
  .get(getProblems);

router.route('/problems/:id')
  .get(getProblem)
  .put(protect, admin, updateProblem)
  .delete(protect, admin, deleteProblem);

router.get('/progress/:courseId', protect, getCourseProgress);

export default router;
