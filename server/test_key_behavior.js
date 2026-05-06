import { GoogleGenerativeAI } from '@google/generative-ai';

const testKeyBehavior = async () => {
  const dummyKey = 'AIzaSy_Dummy_Key_1234567890';
  const genAI = new GoogleGenerativeAI(dummyKey);
  
  try {
    console.log('Testing with DUMMY KEY...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('hi');
    console.log('Result:', result.response.text());
  } catch (err) {
    console.log('Dummy Key Error:', err.message);
  }
};

testKeyBehavior();
