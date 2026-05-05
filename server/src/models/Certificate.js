import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
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
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    certificateData: {
      studentName: String,
      courseTitle: String,
      completionDate: Date,
      aiSummary: String,
    },
  },
  { timestamps: true }
);

// One certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
