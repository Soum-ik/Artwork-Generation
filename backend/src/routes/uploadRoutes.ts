import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import upload from '../utils/fileStorage';
import { uploadArtwork } from '../controllers/uploadController';

const router = Router();

router.post('/artwork', authMiddleware, upload.single('artwork'), uploadArtwork);

export default router; 