import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    videoUrl: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0,
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    keyPoints: [
      {
        type: String,
      },
    ],
    quizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
      },
    ],
    flashcards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;
