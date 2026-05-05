import Course from '../models/Course.js';
import User from '../models/User.js';
import Module from '../models/Module.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';

// @desc    Get all pending courses
// @route   GET /api/admin/courses/pending
// @access  Private/Admin
export const getPendingCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('instructor', 'name email')
      .populate('modules')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a course
// @route   PUT /api/admin/courses/:id/approve
// @access  Private/Admin
export const approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.status = 'approved';
    course.rejectionReason = '';
    const updated = await course.save();

    res.json({
      success: true,
      message: 'Course approved successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a course
// @route   PUT /api/admin/courses/:id/reject
// @access  Private/Admin
export const rejectCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    course.status = 'rejected';
    course.rejectionReason = req.body.reason || 'No reason provided';
    const updated = await course.save();

    res.json({
      success: true,
      message: 'Course rejected',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin delete any course (cascade)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const adminDeleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
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
      message: 'Course and all associated data deleted by admin',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update any user (name, email, role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isBlocked } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, isBlocked },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      res.status(400);
      throw new Error('Admin cannot delete their own account');
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
