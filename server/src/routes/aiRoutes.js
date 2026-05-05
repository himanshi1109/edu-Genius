import express from 'express';
import { 
  askAITutor, 
  askLandingAITutor, 
  generateQuiz, 
  generateFlashcards, 
  generateCourseQuiz 
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, askAITutor);
router.post('/landing-chat', askLandingAITutor);
router.post('/quiz/:lessonId', protect, generateQuiz);
router.post('/quiz-course/:courseId', protect, generateCourseQuiz);
router.post('/flashcards/:lessonId', protect, generateFlashcards);

export default router;
