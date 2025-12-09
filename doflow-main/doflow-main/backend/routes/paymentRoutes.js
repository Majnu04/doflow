import express from 'express';
import { createOrder, verifyPayment, getUserEnrollments, handleWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Webhook route (must be public, but verified via signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/enrollments', protect, getUserEnrollments);

export default router;
