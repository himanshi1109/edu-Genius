import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const key = process.env.GEMINI_API_KEY;
console.log('Using Key:', key ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : 'MISSING');

const testModels = async () => {
  const genAI = new GoogleGenerativeAI(key);
  
  const models = ['gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-pro'];


  
  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('hi');
      console.log(`✅ ${modelName} works! Response: ${result.response.text()}`);
      return; // Stop at first working model
    } catch (err) {
      console.log(`❌ ${modelName} failed: ${err.message}`);
    }
  }
};

testModels();
