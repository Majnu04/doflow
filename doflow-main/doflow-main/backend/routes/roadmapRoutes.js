import express from 'express';
import {
  getRoadmaps,
  getRoadmapDetails,
  createRoadmap,
  updateRoadmap,
  addSection,
  addProblem,
  updateProblem,
  deleteProblem
} from '../controllers/roadmapController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRoadmaps);
router.get('/:courseId', getRoadmaps);
router.get('/:id/details', getRoadmapDetails);
router.post('/', protect, admin, createRoadmap);
router.put('/:id', protect, admin, updateRoadmap);
router.post('/:id/sections', protect, admin, addSection);
router.post('/:id/sections/:sectionId/problems', protect, admin, addProblem);
router.put('/:id/sections/:sectionId/problems/:problemId', protect, admin, updateProblem);
router.delete('/:id/sections/:sectionId/problems/:problemId', protect, admin, deleteProblem);

export default router;
