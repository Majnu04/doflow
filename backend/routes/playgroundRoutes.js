import express from 'express';
import { runPlayground } from '../controllers/playgroundController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/run', protect, runPlayground);

export default router;
