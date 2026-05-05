import express from 'express';
import { body } from 'express-validator';
import {
  createQuiz,
  getQuizzesByLesson,
  getQuizzesByCourse,
  submitQuiz,
  updateQuiz,
  deleteQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

// Create quiz for a lesson
router.post(
  '/:lessonId',
  protect,
  authorize('instructor'),
  [
    body('questions')
      .isArray({ min: 1 })
      .withMessage('At least one question is required'),
    body('questions.*.question')
      .notEmpty()
      .withMessage('Each question must have text'),
    body('questions.*.options')
      .isArray({ min: 2 })
      .withMessage('Each question must have at least 2 options'),
    body('questions.*.correctAnswer')
      .notEmpty()
      .withMessage('Each question must have a correct answer'),
  ],
  validate,
  createQuiz
);

// Get quizzes by lesson
router.get('/lesson/:lessonId', protect, getQuizzesByLesson);

// Get quizzes by course
router.get('/course/:courseId', protect, getQuizzesByCourse);

// Submit quiz answers
router.post(
  '/:id/submit',
  protect,
  [body('answers').isArray().withMessage('Answers must be an array')],
  validate,
  submitQuiz
);

// Update a quiz
router.put(
  '/:id',
  protect,
  authorize('instructor'),
  validate,
  updateQuiz
);

// Delete a quiz
router.delete('/:id', protect, authorize('instructor'), deleteQuiz);

export default router;
