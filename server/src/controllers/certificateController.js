import Certificate from '../models/Certificate.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const getModel = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('Gemini API key is not configured on the server');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};

// Helper for retries and model fallback
const generateWithRetry = async (genAI, prompt, retries = 1) => {
  const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Certificate AI: Trying model ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ]
      });
      const result = await model.generateContent(prompt);
      if (!result.response) throw new Error('Empty response');
      return result;
    } catch (error) {
      console.error(`Certificate AI: Model ${modelName} failed: ${error.message}`);
      lastError = error;
      if (error.message.includes('404') || error.message.includes('429')) continue;
      if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
    }
  }
  throw lastError;
};


// @desc    Request a certificate after completion
// @route   POST /api/certificates/request/:courseId
export const requestCertificate = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id, courseId: req.params.courseId });
    if (!progress || progress.state !== 'completed') {
      res.status(403);
      throw new Error('Course not completed yet');
    }

    const course = await Course.findById(req.params.courseId);
    const user = await User.findById(req.user._id);

    // AI Generation of personalized summary
    let aiSummary = '';
    try {
      const genAI = getModel();
      const prompt = `Write a short, professional, and encouraging 2-sentence achievement summary for a certificate. 
      Student: ${user.name}
      Course: ${course.title}
      Include praise for their dedication and potential in this field.`;
      const result = await generateWithRetry(genAI, prompt);
      aiSummary = result.response.text().trim();

    } catch (aiErr) {
      console.warn('AI Certificate Summary generation failed:', aiErr.message);
      aiSummary = `Successfully completed all modules and requirements for the ${course.title} course.`;
    }

    const certificate = await Certificate.create({
      userId: req.user._id,
      courseId: req.params.courseId,
      status: 'pending',
      certificateData: {
        studentName: user.name,
        courseTitle: course.title,
        completionDate: new Date(),
        aiSummary
      }
    });

    res.status(201).json({ success: true, data: certificate });
  } catch (error) { next(error); }
};

// @desc    Get my certificates
export const getMyCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id }).populate('courseId', 'title thumbnail');
    res.json({ success: true, data: certs });
  } catch (error) { next(error); }
};

// @desc    Get pending certificates for instructor courses
export const getInstructorCertificates = async (req, res, next) => {
  try {
    const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = myCourses.map(c => c._id);

    const certs = await Certificate.find({ 
      courseId: { $in: courseIds } 
    }).populate('userId', 'name email').populate('courseId', 'title thumbnail');

    res.json({ success: true, data: certs });
  } catch (error) { next(error); }
};

// @desc    Update certificate status (Approve/Reject)
export const updateCertificateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const cert = await Certificate.findById(req.params.id).populate('courseId');
    if (!cert) { res.status(404); throw new Error('Certificate not found'); }

    // Auth check
    if (req.user.role !== 'admin' && cert.courseId.instructor.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    cert.status = status;
    if (status === 'approved') {
      cert.certificateUrl = `https://edugenius.app/verify/${uuidv4()}`;
      cert.issuedAt = new Date();
    }
    await cert.save();

    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};

// @desc    Get certificate by ID
export const getCertificateById = async (req, res, next) => {
  try {
    const cert = await Certificate.findById(req.params.id)
      .populate('userId', 'name email')
      .populate({
        path: 'courseId',
        select: 'title instructor',
        populate: { path: 'instructor', select: 'name email' }
      });

    if (!cert) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    // Auth check: student owner, course instructor, or admin
    const isOwner = cert.userId._id.toString() === req.user._id.toString();
    const isInstructor = cert.courseId.instructor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isInstructor && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this certificate');
    }

    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
};

// LEGACY SUPPORT
export const generateCertificate = requestCertificate;

export const getCertificate = async (req, res, next) => {
    try {
        const cert = await Certificate.findOne({ userId: req.user._id, courseId: req.params.courseId }).populate('courseId', 'title');
        if (!cert) { res.status(404); throw new Error('Not found'); }
        res.json({ success: true, data: cert });
    } catch (error) { next(error); }
};
export const issueStudentCertificate = updateCertificateStatus;
