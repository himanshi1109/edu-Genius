import Module from '../models/Module.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';

// @desc    Add a module to a course
// @route   POST /api/modules/:courseId
// @access  Private/Instructor
export const addModule = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this course');
    }

    const { title, order } = req.body;

    const moduleOrder = order !== undefined ? order : course.modules.length;

    const newModule = await Module.create({
      courseId: course._id,
      title,
      order: moduleOrder,
    });

    course.modules.push(newModule._id);
    await course.save();

    res.status(201).json({
      success: true,
      data: newModule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private/Instructor
export const updateModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);

    if (!mod) {
      res.status(404);
      throw new Error('Module not found');
    }

    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this module');
    }

    mod.title = req.body.title || mod.title;
    if (req.body.order !== undefined) {
      mod.order = req.body.order;
    }

    const updatedModule = await mod.save();

    res.json({
      success: true,
      data: updatedModule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a module (and its lessons + quizzes)
// @route   DELETE /api/modules/:id
// @access  Private/Instructor
export const deleteModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);

    if (!mod) {
      res.status(404);
      throw new Error('Module not found');
    }

    const course = await Course.findById(mod.courseId);

    if (course.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this module');
    }

    // Cascade delete lessons and quizzes
    const lessons = await Lesson.find({ moduleId: mod._id });
    for (const lesson of lessons) {
      await Quiz.deleteMany({ lessonId: lesson._id });
    }
    await Lesson.deleteMany({ moduleId: mod._id });

    // Remove module ref from course
    course.modules.pull(mod._id);
    await course.save();

    await mod.deleteOne();

    res.json({
      success: true,
      message: 'Module and associated data removed',
    });
  } catch (error) {
    next(error);
  }
};
