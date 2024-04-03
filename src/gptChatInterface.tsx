import React, { useState } from 'react';
import OpenAI from "openai";
interface GptChatInterfaceProps {
  loadEditor: (container: HTMLElement) => Promise<void>;
}
const GptChatInterface = ({ loadEditor }: GptChatInterfaceProps) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [assistantsapiKey, setAssistantsApiKey] = useState('');
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

    } else {

      const openai = new OpenAI({
        apiKey: apiKey, 
        dangerouslyAllowBrowser: true
      });

      const thread = await openai.beta.threads.create();

      const message = await openai.beta.threads.messages.create(
        thread.id,
        {
          role: "user",
          content: formattedPrompt
        }
      );
      
      let run = await openai.beta.threads.runs.create(
        thread.id,
        { 
          assistant_id: assistantsapiKey,
        }
      );

      while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        run = await openai.beta.threads.runs.retrieve(
          run.thread_id,
          run.id
        );
      }

      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        console.log(messages.data[0])
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(JSON.stringify(messages.data[0].content[0]));
          var jsonOutput = parsedResponse["text"]["value"]
          console.log("loading GPT output:",jsonOutput);
          await loadEditor(JSON.parse(jsonOutput));
          
        } catch (error) {
            console.error("Error parsing response:", error);
            return;
        }
          
  
        
      } else {
        console.log(run.status);
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
      <input
        type="text"
        placeholder="Assistants API Key"
        style={inputStyle}
        value={assistantsapiKey}
        onChange={(e) => setAssistantsApiKey(e.target.value)}
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
