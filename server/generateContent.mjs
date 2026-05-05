import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from './src/config/db.js';
import Course from './src/models/Course.js';
import Module from './src/models/Module.js';
import Lesson from './src/models/Lesson.js';
import Quiz from './src/models/Quiz.js';
import User from './src/models/User.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash-lite' });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateCourse(instructorId, topic) {
  console.log(`Generating course on "${topic}" for instructor ${instructorId}...`);
  
  // 1. Generate Course metadata
  const coursePrompt = `Generate a course for the topic "${topic}". 
  Provide a title, description, and category.
  Format as JSON: { "title": "...", "description": "...", "category": "..." }`;
  
  await sleep(5000);
  const courseRes = await model.generateContent(coursePrompt);

  const courseData = JSON.parse(courseRes.response.text().replace(/```json|```/g, '').trim());
  
  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
    status: 'approved',
    price: Math.floor(Math.random() * 50) + 10
  });

  // 2. Generate 2 Modules
  for (let i = 1; i <= 2; i++) {
    const modPrompt = `Generate a module title for Module ${i} of the course "${course.title}". 
    Format as JSON: { "title": "..." }`;
    await sleep(5000);
    const modRes = await model.generateContent(modPrompt);
    const modData = JSON.parse(modRes.response.text().replace(/```json|```/g, '').trim());
    
    const module = await Module.create({
      courseId: course._id,
      title: modData.title,
      order: i
    });
    
    course.modules.push(module._id);

    // 3. Generate 2 Lessons per module
    for (let j = 1; j <= 2; j++) {
      const lesPrompt = `Generate lesson details for Lesson ${j} of module "${module.title}".
      Include title, content (approx 200 words), summary, keyPoints (array of 3 strings), and flashcards (array of 3 objects with question/answer).
      Format as JSON: { "title": "...", "content": "...", "summary": "...", "keyPoints": ["...", "...", "..."], "flashcards": [{ "question": "...", "answer": "..." }, ...] }`;
      
      await sleep(5000);
      const lesRes = await model.generateContent(lesPrompt);
      const lesData = JSON.parse(lesRes.response.text().replace(/```json|```/g, '').trim());
      
      const lesson = await Lesson.create({
        moduleId: module._id,
        ...lesData,
        duration: Math.floor(Math.random() * 30) + 15
      });
      
      module.lessons.push(lesson._id);

      // 4. Generate Quiz for each lesson
      const quizPrompt = `Generate a 3-question multiple choice quiz for the lesson "${lesson.title}".
      Format as JSON: { "questions": [{ "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "exact string of correct option" }, ...] }`;
      
      await sleep(5000);
      const quizRes = await model.generateContent(quizPrompt);
      const quizData = JSON.parse(quizRes.response.text().replace(/```json|```/g, '').trim());
      
      const quiz = await Quiz.create({
        lessonId: lesson._id,
        questions: quizData.questions,
        difficulty: 'medium'
      });
      
      lesson.quizzes.push(quiz._id);
      await lesson.save();
    }
    await module.save();
  }
  await course.save();
  console.log(`Finished generating course: ${course.title}`);
}

async function run() {
  await connectDB();
  
  const instructors = [
    { id: '69f353dcdba5014056eaeba2', topics: ['Advanced React Patterns', 'Node.js Microservices'] },
    { id: '69f857c5dffb86ac280a64d2', topics: ['Modern Web with Next.js', 'Data Structures in JavaScript'] }
  ];

  for (const instr of instructors) {
    for (const topic of instr.topics) {
      await generateCourse(instr.id, topic);
    }
  }

  console.log('--- ALL COURSES GENERATED SUCCESSFULLY ---');
  process.exit(0);
}

run().catch(console.error);
