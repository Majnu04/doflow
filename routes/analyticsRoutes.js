import express from 'express';
import { trackEvent, getConversionAnalytics } from '../controllers/analyticsController.js';
import { protect, admin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/event', optionalAuth, trackEvent);
router.get('/conversions', protect, admin, getConversionAnalytics);

export default router;
