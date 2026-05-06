import axios from 'axios';

const testLocalAI = async () => {
  try {
    console.log('Testing local AI endpoint...');
    const res = await axios.post('http://localhost:8080/api/ai/landing-chat', {
      prompt: 'What courses do you have?'
    });
    console.log('Success!', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Failed:', err.response ? err.response.data : err.message);
  }
};

testLocalAI();
