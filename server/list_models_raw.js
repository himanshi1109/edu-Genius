const listModelsRaw = async () => {
  const key = 'AIzaSyAfbIaHTYS1naeJUjXBSUAdobIFpk1v7g4';
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${key}`;
  
  try {
    console.log('Listing available models...');
    const response = await fetch(url);
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Models:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
};

listModelsRaw();
