import express from 'express';
import {
  enrollInCourse,
  updateProgress,
  getProgress,
  getAllProgressForCourse,
  getMyProgress,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// Enroll in a course
router.post('/enroll/:courseId', protect, authorize('student', 'admin'), enrollInCourse);

// Get all completed progress for a course (instructor/admin only)
router.get('/course/:courseId/all', protect, authorize('instructor', 'admin'), getAllProgressForCourse);

// Get my progress records
router.get('/my', protect, getMyProgress);

// Update / Get progress for a course
router
  .route('/:courseId')
  .put(protect, updateProgress)
  .get(protect, getProgress);

export default router;
