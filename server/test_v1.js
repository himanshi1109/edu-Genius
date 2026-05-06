const testV1 = async () => {
  const key = 'AIzaSyAfbIaHTYS1naeJUjXBSUAdobIFpk1v7g4';
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${key}`;

  
  try {
    console.log('Testing V1 endpoint...');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'hi' }] }]
      })
    });
    
    const data = await response.json();
    console.log('V1 Response Status:', response.status);
    console.log('V1 Response Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('V1 Error:', err.message);
  }
};

testV1();
