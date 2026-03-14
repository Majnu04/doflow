import express from 'express';
import { runPlayground } from '../controllers/playgroundController.js';

const router = express.Router();

router.post('/run', runPlayground);

export default router;
