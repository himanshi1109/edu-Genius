import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';

// @desc    Create a quiz for a lesson
// @route   POST /api/quizzes/:lessonId
// @access  Private/Instructor
export const createQuiz = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to create quiz for this lesson');
    }

    const { questions, difficulty } = req.body;

    const quiz = await Quiz.create({
      lessonId: lesson._id,
      questions,
      difficulty: difficulty || 'medium',
    });

    lesson.quizzes.push(quiz._id);
    await lesson.save();

    res.status(201).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quizzes by lesson ID
// @route   GET /api/quizzes/lesson/:lessonId
// @access  Private
export const getQuizzesByLesson = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ lessonId: req.params.lessonId });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quizzes by course ID
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getQuizzesByCourse = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });

    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and get score
// @route   POST /api/quizzes/:id/submit
// @access  Private
export const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const { answers } = req.body; // Array of answers in order

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      throw new Error('Please provide answers as an array');
    }

    if (answers.length !== quiz.questions.length) {
      res.status(400);
      throw new Error(`Expected ${quiz.questions.length} answers, got ${answers.length}`);
    }

    // Grade the quiz
    let correct = 0;
    const results = quiz.questions.map((q, index) => {
      const studentAns = answers[index];
      const correctAns = q.correctAnswer;
      
      // Check if correctAns is an index (0, 1, 2...) or a string matching an option
      let isCorrect = false;
      
      // If studentAns is an index
      if (typeof studentAns === 'number') {
        const optionText = q.options[studentAns];
        // Compare with string answer OR check if correctAns is actually the index
        isCorrect = (optionText === correctAns) || (studentAns.toString() === correctAns);
      } else {
        // Direct string comparison
        isCorrect = studentAns === correctAns;
      }

      if (isCorrect) correct++;

      return {
        question: q.question,
        yourAnswer: typeof studentAns === 'number' ? q.options[studentAns] : studentAns,
        correctAnswer: isNaN(parseInt(correctAns)) ? correctAns : q.options[parseInt(correctAns)] || correctAns,
        isCorrect,
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    // Update progress quiz scores
    let courseId = quiz.courseId;

    if (!courseId && quiz.lessonId) {
      const lesson = await Lesson.findById(quiz.lessonId);
      if (lesson) {
        const mod = await Module.findById(lesson.moduleId);
        if (mod) courseId = mod.courseId;
      }
    }

    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId,
    });

    if (progress) {
      const existingScore = progress.quizScores.find(
        (qs) => qs.lessonId.toString() === quiz.lessonId.toString()
      );

      if (existingScore) {
        existingScore.score = score;
        existingScore.attempts += 1;
      } else {
        progress.quizScores.push({
          lessonId: quiz.lessonId,
          score,
          attempts: 1,
        });
      }
      await progress.save();
    }

    res.json({
      success: true,
      data: {
        score,
        correct,
        total: quiz.questions.length,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Private/Instructor
export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const lesson = await Lesson.findById(quiz.lessonId);
    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this quiz');
    }

    if (req.body.questions) quiz.questions = req.body.questions;
    if (req.body.difficulty) quiz.difficulty = req.body.difficulty;

    await quiz.save();

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Instructor
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found');
    }

    const lesson = await Lesson.findById(quiz.lessonId);
    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this quiz');
    }

    lesson.quizzes.pull(quiz._id);
    await lesson.save();
    
    await quiz.deleteOne();

    res.json({
      success: true,
      message: 'Quiz deleted',
    });
  } catch (error) {
    next(error);
  }
};
