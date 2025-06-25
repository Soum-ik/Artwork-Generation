import { Router } from 'express';
import authRoutes from './authRoutes';
import uploadRoutes from './uploadRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/user', userRoutes);

export default router; 