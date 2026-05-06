import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const key = process.env.GEMINI_API_KEY;

const listModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(key);
    // There isn't a direct listModels in the client SDK easily accessible this way, 
    // but we can try a very old model name.
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });
    const result = await model.generateContent('hi');
    console.log('gemini-1.0-pro works!');
  } catch (err) {
    console.log('gemini-1.0-pro failed:', err.message);
  }
};

listModels();
