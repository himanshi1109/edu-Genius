import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    // Normalize path for local uploads on Windows
    let thumbnail = req.file?.path || '';
    if (thumbnail && !thumbnail.startsWith('http')) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      thumbnail,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    let query = { status: 'approved' };
    if (req.user && req.user.role === 'instructor') {
      query = { $or: [{ status: 'approved' }, { instructor: req.user._id }] };
    }
    if (req.user && req.user.role === 'admin') {
      query = {};
    }
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate({
        path: 'modules',
        populate: { path: 'lessons' }
      });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
          populate: {
            path: 'quizzes',
          },
        },
      });

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this course');
    }

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;

    if (req.file?.path) {
      course.thumbnail = req.file.path;
    }

    const updatedCourse = await course.save();

    res.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course (and all associated modules, lessons, quizzes)
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this course');
    }

    // Cascade delete: modules → lessons → quizzes
    const modules = await Module.find({ courseId: course._id });
    for (const mod of modules) {
      const lessons = await Lesson.find({ moduleId: mod._id });
      for (const lesson of lessons) {
        await Quiz.deleteMany({ lessonId: lesson._id });
      }
      await Lesson.deleteMany({ moduleId: mod._id });
    }
    await Module.deleteMany({ courseId: course._id });

    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course and all associated data removed',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students enrolled in a course
// @route   GET /api/courses/:id/students
// @access  Private/Instructor or Admin
export const getEnrolledStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name email createdAt');

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Auth check: only instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view student list for this course');
    }

    res.json({
      success: true,
      data: course.enrolledStudents,
    });
  } catch (error) {
    next(error);
  }
};
