import express, { Router } from 'express';
import * as eventController from '../controllers/eventController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();

// Configure multer for event image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `event-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png) are allowed!'));
    }
  },
});

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Private routes
router.post('/', protect, upload.single('image'), eventController.createEvent);
router.put('/:id', protect, upload.single('image'), eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);
router.post('/:id/register', protect, eventController.registerForEvent);
router.delete('/:id/register', protect, eventController.unregisterFromEvent);

export default router; 