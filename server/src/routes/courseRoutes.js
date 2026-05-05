import express from 'express';
import { body } from 'express-validator';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getEnrolledStudents,
} from '../controllers/courseController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    authorize('instructor', 'admin'),
    uploadImage,
    [
      body('title').trim().notEmpty().withMessage('Course title is required'),
      body('description').trim().notEmpty().withMessage('Description is required'),
    ],
    validate,
    createCourse
  )
  .get(optionalAuth, getCourses);

router
  .route('/:id')
  .get(getCourseById)
  .put(protect, authorize('instructor', 'admin'), uploadImage, updateCourse)
  .delete(protect, authorize('instructor', 'admin'), deleteCourse);

router.get('/:id/students', protect, authorize('instructor', 'admin'), getEnrolledStudents);

export default router;
