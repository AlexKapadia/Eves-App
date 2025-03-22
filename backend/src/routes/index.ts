import express, { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import eventRoutes from './eventRoutes';
import postRoutes from './postRoutes';

const router: Router = express.Router();

// Mount all routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/events', eventRoutes);
router.use('/api/posts', postRoutes);

export default router; 