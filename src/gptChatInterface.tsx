import React, { useState } from 'react';
import OpenAI from "openai";

const GptChatInterface = () => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const chatStyle: React.CSSProperties = {
    padding: '20px',
    margin: '10px 0',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    maxWidth: '600px',
    position: 'fixed',
    top: 50,
    right: 5,
    maxHeight: '100%',
    overflowY: 'auto',
    backgroundColor: 'white',
    zIndex: 1000,
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px',
    margin: '10px 0',
    width: 'calc(100% - 22px)',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    cursor: 'pointer',
    margin: '10px 0',
  };

  const handleSendPrompt = async () => {
    const formattedPrompt = prompt.trim();
    
    if (!apiKey || !formattedPrompt) {
      alert('API Key and prompt are required.');
      return;
    }
  
    const openai = new OpenAI({
      apiKey: apiKey
    });
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "system", content: formattedPrompt }],
        temperature: 0.7,
        max_tokens: 60,
      });
  
      console.log(response.choices[0].message);
      // setResponse(response.data.choices[0].text.trim());
    } catch (error) {
      console.error('Error calling the OpenAI API:', error);
      setResponse('Failed to fetch response from the API.');
    }
  };
  

  return (
    <div style={chatStyle}>
      <input
        type="text"
        placeholder="API Key"
        style={inputStyle}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <textarea
        placeholder="Enter your prompt"
        style={{...inputStyle, height: '100px'}}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button style={buttonStyle} onClick={handleSendPrompt}>Send Prompt</button>
      <div>
        <p>Response:</p>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default GptChatInterface;
