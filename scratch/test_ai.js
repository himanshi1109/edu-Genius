import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../server/.env' });

const testAI = async () => {
  try {
    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
    if (!process.env.GEMINI_API_KEY) return;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Sending test prompt...');
    const result = await model.generateContent('Say hello and confirm you are working.');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAI();
