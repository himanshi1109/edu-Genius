import Lesson from '../models/Lesson.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

// @desc    Add a lesson to a module (with optional video upload)
// @route   POST /api/lessons/:moduleId
// @access  Private/Instructor
export const addLesson = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.moduleId);

    if (!mod) {
      res.status(404);
      throw new Error('Module not found');
    }

    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this module');
    }

    const { title, content, duration, transcript, summary, keyPoints, flashcards } = req.body;

    const lesson = await Lesson.create({
      moduleId: mod._id,
      title,
      content: content || '',
      videoUrl: req.file ? req.file.path : '',
      duration: duration || 0,
      transcript: transcript || '',
      summary: summary || '',
      keyPoints: keyPoints || [],
      flashcards: flashcards || [],
    });

    mod.lessons.push(lesson._id);
    await mod.save();

    res.status(201).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Private/Instructor
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this lesson');
    }

    const fields = ['title', 'content', 'duration', 'transcript', 'summary', 'keyPoints', 'flashcards'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lesson[field] = req.body[field];
      }
    });

    if (req.file) {
      lesson.videoUrl = req.file.path;
    }

    const updatedLesson = await lesson.save();

    res.json({
      success: true,
      data: updatedLesson,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lesson (and its quizzes)
// @route   DELETE /api/lessons/:id
// @access  Private/Instructor
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    const mod = await Module.findById(lesson.moduleId);
    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this lesson');
    }

    // Delete associated quizzes
    await Quiz.deleteMany({ lessonId: lesson._id });

    // Remove lesson ref from module
    mod.lessons.pull(lesson._id);
    await mod.save();

    await lesson.deleteOne();

    res.json({
      success: true,
      message: 'Lesson and associated quizzes removed',
    });
  } catch (error) {
    next(error);
  }
};
