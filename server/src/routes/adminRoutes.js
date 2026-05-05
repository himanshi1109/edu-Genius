import express from 'express';
import {
  getPendingCourses,
  approveCourse,
  rejectCourse,
  adminDeleteCourse,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes in this file require a valid token AND admin role
router.use(protect, authorize('admin'));

// Course approval routes
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', adminDeleteCourse);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
