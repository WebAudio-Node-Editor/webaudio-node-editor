import React, { useState } from 'react';
import OpenAI from "openai";
import * as fs from 'fs';
import os from 'os';
import {formatter_prompt, assistant_instructions} from './prompts';

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
    
    // BELOW IS THE FUNCTION TO CREATE OR LOAD AN ASSISTANT
    const knowledge_base = openai.files.create({
      file : fs.createReadStream('PLACEHOLDER.py','utf8'),
      purpose : 'assistants',
    });
    
    const path = 'assistant.json'

    if (fs.existsSync(path)){
      fs.readFile(path, 'utf8', (err, data) => {
        if (err){
          console.error('Error reading file: ', err);
          return;
        }
        try {
          const assistantData = JSON.parse(data);
          const assistantID = assistantData.assistant_id;
          console.log("Loaded existing assistant ID: ", assistantID);
        } catch(error) {
          console.error("Error parsing JSON: ", error)
        }
      });
    } else {
      try {
        const assistant = await openai.beta.assistants.create({
          model: "gpt-4",
          instructions: assistant_instructions,
          tools : [{"type" : "retrieval"}],
          file_ids : [(await knowledge_base).id]
        });
            // setResponse(response.data.choices[0].text.trim());
      } catch (error) {
        console.error('Error calling the OpenAI API:', error);
        setResponse('Failed to fetch response from the API.');
      }
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
