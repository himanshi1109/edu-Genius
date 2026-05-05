import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
      },
    ],
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    quizScores: [
      {
        lessonId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
          required: true,
        },
        score: { type: Number, required: true },
        attempts: { type: Number, default: 1 },
      },
    ],
    state: {
      type: String,
      enum: ['not_started', 'learning', 'revising', 'completed'],
      default: 'not_started',
    },
  },
  { timestamps: true }
);

// Compound index to ensure one progress record per user per course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
