import express from 'express';
import { executeCode, validateCode } from '../controllers/codeExecutionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Execute code
router.post('/execute', protect, executeCode);

// Validate code (syntax check only)
router.post('/validate', protect, validateCode);

export default router;
