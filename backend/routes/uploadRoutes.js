import express from 'express';
import { upload, uploadFile, getSignedUrl, deleteFile } from '../controllers/uploadController.js';
import { protect, instructor } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, instructor, upload.single('file'), uploadFile);
router.get('/signed-url', protect, getSignedUrl);
router.delete('/', protect, instructor, deleteFile);

export default router;
