import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import upload from '../utils/fileStorage';
import { getUserUploads, uploadArtwork } from '../controllers/uploadController';

const router = Router();

router.post('/artwork', authMiddleware, upload.single('artwork'), uploadArtwork);
router.get('/logs', authMiddleware, getUserUploads);

export default router; 