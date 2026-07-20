import express from 'express';
import {
  generateCertificate,
  getUserCertificates,
  getCertificateById,
  verifyCertificate,
  getCertificateByCourse,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/generate', protect, generateCertificate);
router.get('/my-certificates', protect, getUserCertificates);
router.get('/course/:courseId', protect, getCertificateByCourse);
router.get('/:id', protect, getCertificateById);

// Public route for verification
router.get('/verify/:certificateId', verifyCertificate);

export default router;
