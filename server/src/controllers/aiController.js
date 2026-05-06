import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';

// Initialize Gemini once
const getModel = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
    throw new Error('Gemini API key is not configured on the server');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
};






// Helper for retries
// Helper for retries and model fallback
const generateWithRetry = async (genAI, prompt, retries = 1) => {
  const modelsToTry = ['gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying model: ${modelName}...`);
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
      console.error(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
      // If it's a 404 (model not found) or 429 (quota), try next model immediately
      if (error.message.includes('404') || error.message.includes('429')) continue;
      
      // For other errors, we might want to fail fast or try one more
      if (modelName === modelsToTry[modelsToTry.length - 1]) throw error;
    }
  }
  throw lastError;
};



// @desc    Ask AI Tutor
export const askAITutor = async (req, res, next) => {
  try {
    const { prompt, courseTitle, lessonTitle, lessonContent } = req.body;
    const genAI = getModel();

    const systemPrompt = `You are an expert AI Tutor for the course "${courseTitle}".
    
    Current Lesson: "${lessonTitle}"
    Lesson Content: ${lessonContent || 'No specific content provided for this lesson yet.'}
    
    Student Question: ${prompt}
    
    Your Role:
    - Explain complex concepts simply.
    - Provide examples related to the lesson.
    - If the student's question is unrelated to the lesson, politely bring them back to the topic while giving a brief answer if appropriate.
    - Format your response with bullet points and bold text where helpful for learning.`;

    const result = await generateWithRetry(genAI, systemPrompt);

    res.json({ success: true, data: { response: result.response.text() } });
  } catch (error) { 
    console.error('AI Tutor Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'The AI Tutor is having trouble processing that. Please try rephrasing your question.' 
    });
  }
};


// @desc    Ask Landing Page AI
export const askLandingAITutor = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    // Find approved courses OR courses with no status (legacy/default)
    const courses = await Course.find({ 
      $or: [
        { status: 'approved' },
        { status: { $exists: false } },
        { status: '' }
      ]
    }).select('title description');
    
    const courseContext = courses.length > 0 
      ? courses.map(c => `- ${c.title}: ${c.description}`).join('\n')
      : 'No courses are currently public, but we are a platform for AI-powered learning.';

    const genAI = getModel();

    const systemPrompt = `You are the AI Assistant for EduGenius, a premium AI-LMS platform.
    
    About EduGenius:
    - Features: AI Quiz generation, smart flashcards, progress tracking, and verifiable certificates.
    - Context: Here are our available courses:\n${courseContext}
    
    User Question: ${prompt}
    
    Guidelines:
    - Be professional, helpful, and encouraging.
    - If asked about courses we don't have, suggest similar topics or mention we are always adding more.
    - Keep responses concise and formatted for readability.`;

    const result = await generateWithRetry(genAI, systemPrompt);

    res.json({ success: true, data: { response: result.response.text() } });
  } catch (error) { 
    console.error('Landing AI Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'The AI assistant is currently unavailable. This is often due to an invalid or restricted API key. Please check your GEMINI_API_KEY settings.' 
    });
  }
};




// @desc    Generate Quiz using AI (Lesson level)
export const generateQuiz = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) { res.status(404); throw new Error('Lesson not found'); }
    const genAI = getModel();

    const prompt = `Generate a 5-question multiple choice quiz for the lesson: ${lesson.title}\nContent: ${lesson.content || lesson.summary}\nReturn ONLY a valid JSON array of objects with this exact structure: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}]\nDo not include any other text or markdown formatting.`;
    const result = await generateWithRetry(genAI, prompt);

    let text = result.response.text();
    
    // Improved JSON cleaning
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    try {
      const questions = JSON.parse(text);
      const quiz = await Quiz.create({ lessonId: lesson._id, questions, difficulty: 'medium' });
      if (!lesson.quizzes.includes(quiz._id)) { lesson.quizzes.push(quiz._id); await lesson.save(); }
      res.json({ success: true, data: quiz });
    } catch (parseError) {
      console.error('JSON Parse Error:', text);
      throw new Error('AI generated an invalid quiz format. Please try again.');
    }

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
    const genAI = getModel();
    const prompt = `Generate a comprehensive 10-question multiple choice quiz for the course: ${course.title}\nDescription: ${course.description}\nReturn ONLY a JSON array of 10 objects: [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "exact string"}]`;
    const result = await generateWithRetry(genAI, prompt);

    let text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    else text = text.replace(/```json|```/g, '').trim();

    try {
      const questions = JSON.parse(text);
      const quiz = await Quiz.create({ courseId: course._id, questions, difficulty: 'hard' });
      res.json({ success: true, data: quiz });
    } catch (parseError) {
      console.error('Course Quiz Parse Error:', text);
      throw new Error('AI failed to generate a valid course quiz. Please try again.');
    }

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
    const genAI = getModel();
    const prompt = `Generate 5 flashcards for: ${lesson.title}\nContent: ${lesson.content || lesson.summary}\nReturn ONLY a JSON array: [{"question": "...", "answer": "..."}]`;
    const result = await generateWithRetry(genAI, prompt);

    let text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    else text = text.replace(/```json|```/g, '').trim();

    try {
      const flashcards = JSON.parse(text);
      lesson.flashcards = [...(lesson.flashcards || []), ...flashcards];
      await lesson.save();
      res.json({ success: true, data: lesson.flashcards });
    } catch (parseError) {
      console.error('Flashcard Parse Error:', text);
      throw new Error('AI failed to generate valid flashcards. Please try again.');
    }

  } catch (error) { 
    console.error('Flashcard Error:', error);
    next(error); 
  }
};
