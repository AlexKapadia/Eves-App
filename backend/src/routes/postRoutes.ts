import express, { Router } from 'express';
import * as postController from '../controllers/postController';
import { protect } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();

// Configure multer for post image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/posts/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `post-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
    }
  },
});

// Public routes
router.get('/', postController.getPosts);
router.get('/:id', postController.getPostById);

// Private routes
router.post('/', protect, upload.array('images', 5), postController.createPost);
router.put('/:id', protect, upload.array('images', 5), postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.put('/:id/like', protect, postController.likePost);
router.post('/:id/comments', protect, postController.addComment);
router.delete('/:id/comments/:commentId', protect, postController.deleteComment);

export default router; 