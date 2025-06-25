import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getUserUploads } from '../controllers/userController';

const router = Router();

router.get('/uploads', authMiddleware, getUserUploads);

export default router; 