import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';

// Initialize Gemini once
const getModel = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('Gemini API key is not configured on the server');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Using gemini-pro for maximum compatibility
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

// Helper for retries
const generateWithRetry = async (model, prompt, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (i === retries) throw error;
      console.warn(`AI Generation retry ${i + 1} due to error:`, error.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
};

// @desc    Ask AI Tutor
export const askAITutor = async (req, res, next) => {
  try {
    const { prompt, courseTitle, lessonTitle, lessonContent } = req.body;
    const model = getModel();
    const systemPrompt = `You are an AI Tutor for the course "${courseTitle}", helping with "${lessonTitle}".
    Lesson Context: ${lessonContent}
    Student Question: ${prompt}`;
    const result = await generateWithRetry(model, systemPrompt);
    res.json({ success: true, data: { response: result.response.text() } });
  } catch (error) { 
    console.error('AI Tutor Error:', error);
    next(error); 
  }
};

// @desc    Ask Landing Page AI
export const askLandingAITutor = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const courses = await Course.find({ status: 'approved' }).select('title description');
    const courseContext = courses.map(c => `- ${c.title}: ${c.description}`).join('\n');
    const model = getModel();
    const systemPrompt = `You are the AI Assistant for EduGenius. Available courses:\n${courseContext}\nUser Question: ${prompt}`;
    const result = await generateWithRetry(model, systemPrompt);
    res.json({ success: true, data: { response: result.response.text() } });
  } catch (error) { 
    console.error('Landing AI Error:', error);
    next(error); 
  }
};

// @desc    Generate Quiz using AI (Lesson level)
export const generateQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    const model = getModel();
    const prompt = `Generate a 5-question multiple choice quiz for the lesson: ${lesson.title}\nContent: ${lesson.content || lesson.summary}\nReturn ONLY a valid JSON array of objects with this exact structure: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}]\nDo not include any other text or markdown formatting.`;
    const result = await generateWithRetry(model, prompt);
    let text = result.response.text();
    // Clean potential markdown blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const questions = JSON.parse(text);
    const quiz = await Quiz.create({ lessonId: lesson._id, questions, difficulty: 'medium' });
    if (!lesson.quizzes.includes(quiz._id)) { lesson.quizzes.push(quiz._id); await lesson.save(); }
    res.json({ success: true, data: quiz });
  } catch (error) { 
    console.error('Quiz Generation Error:', error);
    next(error); 
  }
};

// @desc    Generate a quiz for a whole course
export const generateCourseQuiz = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) { res.status(404); throw new Error('Course not found'); }
    const model = getModel();
    const prompt = `Generate a comprehensive 10-question multiple choice quiz for the course: ${course.title}\nDescription: ${course.description}\nReturn ONLY a JSON array of 10 objects: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "exact string"}]`;
    const result = await generateWithRetry(model, prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const questions = JSON.parse(text);
    const quiz = await Quiz.create({ courseId: course._id, questions, difficulty: 'hard' });
    res.json({ success: true, data: quiz });
  } catch (error) { 
    console.error('Course Quiz Error:', error);
    next(error); 
  }
};

// @desc    Generate Flashcards using AI
export const generateFlashcards = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    const model = getModel();
    const prompt = `Generate 5 flashcards for: ${lesson.title}\nContent: ${lesson.content || lesson.summary}\nReturn ONLY a JSON array: [{"question": "...", "answer": "..."}]`;
    const result = await generateWithRetry(model, prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    const flashcards = JSON.parse(text);
    lesson.flashcards = [...(lesson.flashcards || []), ...flashcards];
    await lesson.save();
    res.json({ success: true, data: lesson.flashcards });
  } catch (error) { 
    console.error('Flashcard Error:', error);
    next(error); 
  }
};
