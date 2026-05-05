import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';

// @desc    Enroll in a course
// @route   POST /api/progress/enroll/:courseId
// @access  Private/Student
export const enrollInCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const existingProgress = await Progress.findOne({
      userId: req.user._id,
      courseId: course._id,
    });

    if (existingProgress) {
      res.status(400);
      throw new Error('Already enrolled in this course');
    }

    // Find the first lesson to set as currentLesson
    let firstLesson = null;
    if (course.modules.length > 0) {
      const firstModule = await Module.findOne({ courseId: course._id }).sort({ order: 1 });
      if (firstModule && firstModule.lessons.length > 0) {
        firstLesson = firstModule.lessons[0];
      }
    }

    const progress = await Progress.create({
      userId: req.user._id,
      courseId: course._id,
      state: 'learning',
      currentLesson: firstLesson,
    });

    // Add to user's enrolledCourses
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id },
    });

    // Add to course's enrolledStudents and increment count
    await Course.findByIdAndUpdate(course._id, {
      $addToSet: { enrolledStudents: req.user._id },
      $inc: { enrolledCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress (mark lesson complete, update state)
// @route   PUT /api/progress/:courseId
// @access  Private
export const updateProgress = async (req, res, next) => {
  try {
    const { lessonId, state } = req.body;

    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    });

    if (!progress) {
      res.status(404);
      throw new Error('Not enrolled in this course');
    }

    // Mark lesson as completed
    if (lessonId) {
      const lessonExists = await Lesson.findById(lessonId);
      if (!lessonExists) {
        res.status(404);
        throw new Error('Lesson not found');
      }

      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      // Auto-advance currentLesson
      const mod = await Module.findById(lessonExists.moduleId);
      const lessonIndex = mod.lessons.findIndex(
        (l) => l.toString() === lessonId
      );

      if (lessonIndex < mod.lessons.length - 1) {
        // Next lesson in same module
        progress.currentLesson = mod.lessons[lessonIndex + 1];
      } else {
        // Try first lesson of next module
        const allModules = await Module.find({ courseId: req.params.courseId }).sort({ order: 1 });
        const modIndex = allModules.findIndex(
          (m) => m._id.toString() === mod._id.toString()
        );

        if (modIndex < allModules.length - 1) {
          const nextMod = allModules[modIndex + 1];
          if (nextMod.lessons.length > 0) {
            progress.currentLesson = nextMod.lessons[0];
          }
        }
      }
    }

    // Update state if provided
    if (state) {
      progress.state = state;
    }

    // Calculate completion — check if all lessons completed
    const modules = await Module.find({ courseId: req.params.courseId });
    let totalLessons = 0;
    modules.forEach((m) => {
      totalLessons += m.lessons.length;
    });

    if (totalLessons > 0 && progress.completedLessons.length >= totalLessons) {
      progress.state = 'completed';
    }

    const updatedProgress = await progress.save();

    res.json({
      success: true,
      data: updatedProgress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
// @access  Private
export const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      courseId: req.params.courseId,
    })
      .populate('courseId', 'title')
      .populate('currentLesson', 'title')
      .populate('completedLessons', 'title');

    if (!progress) {
      res.status(404);
      throw new Error('No progress found for this course');
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all completed students' progress for a course
// @route   GET /api/progress/course/:courseId/all
// @access  Private/Instructor or Admin
export const getAllProgressForCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (
      req.user.role === 'instructor' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error('Not authorized to view progress for this course');
    }

    const progressList = await Progress.find({
      courseId: req.params.courseId,
      state: 'completed',
    }).populate('userId', 'name email');

    res.json({
      success: true,
      data: progressList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all progress records for the current user
// @route   GET /api/progress/my
// @access  Private
export const getMyProgress = async (req, res, next) => {
  try {
    const progressRecords = await Progress.find({ userId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title thumbnail modules',
        populate: {
          path: 'modules',
          select: 'lessons',
        }
      });

    // Calculate percentage for each
    const data = await Promise.all(progressRecords.map(async (p) => {
      const course = p.courseId;
      if (!course) return null;

      // Count total lessons across all modules
      const modules = await Module.find({ courseId: course._id });
      let totalLessons = 0;
      modules.forEach(m => totalLessons += m.lessons.length);

      const completedCount = p.completedLessons.length;
      const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Calculate avg quiz score
      const quizScores = p.quizScores || [];
      const avgQuizScore = quizScores.length > 0 
        ? Math.round(quizScores.reduce((acc, curr) => acc + curr.score, 0) / quizScores.length)
        : 0;

      return {
        _id: p._id,
        courseId: course._id,
        courseTitle: course.title,
        thumbnail: course.thumbnail,
        completedLessons: completedCount,
        totalLessons,
        percentage,
        avgQuizScore,
        state: p.state,
        updatedAt: p.updatedAt
      };

    }));

    res.json({
      success: true,
      data: data.filter(item => item !== null),
    });
  } catch (error) {
    next(error);
  }
};

