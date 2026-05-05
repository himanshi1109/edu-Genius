import express from 'express';
import { body } from 'express-validator';
import {
  addLesson,
  updateLesson,
  deleteLesson,
} from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { uploadVideo } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Add lesson to a module (with video upload)
router.post(
  '/:moduleId',
  protect,
  authorize('instructor'),
  uploadVideo,
  [body('title').trim().notEmpty().withMessage('Lesson title is required')],
  validate,
  addLesson
);

// Update / Delete lesson
router
  .route('/:id')
  .put(protect, authorize('instructor'), uploadVideo, updateLesson)
  .delete(protect, authorize('instructor'), deleteLesson);

export default router;
