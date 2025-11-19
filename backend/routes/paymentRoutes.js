import express from 'express';
import { createOrder, verifyPayment, getUserEnrollments } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/enrollments', protect, getUserEnrollments);

export default router;
