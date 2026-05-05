import express from 'express';
import { body } from 'express-validator';
import {
  addModule,
  updateModule,
  deleteModule,
} from '../controllers/moduleController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

// Add module to a course
router.post(
  '/:courseId',
  protect,
  authorize('instructor'),
  [body('title').trim().notEmpty().withMessage('Module title is required')],
  validate,
  addModule
);

// Update / Delete module
router
  .route('/:id')
  .put(protect, authorize('instructor'), updateModule)
  .delete(protect, authorize('instructor'), deleteModule);

export default router;
