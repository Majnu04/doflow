import express from 'express';
import { sendUpgradeReminders } from '../controllers/marketingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/upgrade-reminders', protect, admin, sendUpgradeReminders);

export default router;
