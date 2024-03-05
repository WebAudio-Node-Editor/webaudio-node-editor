import React, { useState } from 'react';
import axios from 'axios';

const GptChatInterface = () => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSendPrompt = async () => {
    const data = {
      model: 'gpt-4',
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 60,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };

    try {
      const result = await axios.post('https://api.openai.com/v1/completions', data, { headers });
      setResponse(result.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error calling the OpenAI API:', error);
      setResponse('Error communicating with the API.');
    }
  };

  return (
    <div>
      <h2>GPT Chat Interface</h2>
      <input
        type="text"
        placeholder="API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <textarea
        placeholder="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleSendPrompt}>Send Prompt</button>
      <div>
        <p>Response:</p>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default GptChatInterface;