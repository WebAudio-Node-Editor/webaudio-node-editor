import React, { useState } from 'react'
import OpenAI from 'openai'
interface GptChatInterfaceProps {
    loadEditor: (container: HTMLElement) => Promise<void>
}
const GptChatInterface = ({ loadEditor }: GptChatInterfaceProps) => {
    const [apiKey, setApiKey] = useState('')
    const [prompt, setPrompt] = useState('')
    const [assistantsapiKey, setAssistantsApiKey] = useState('')
    const [response, setResponse] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [nodeCount, setNodeCount] = useState('');

    const chatStyle: React.CSSProperties = {
        padding: '20px',
        margin: '10px 0',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        maxWidth: '600px',
        position: 'fixed',
        top: 50,
        right: 5,
        height: '600px',
        overflowY: 'auto',
        backgroundColor: 'white',
        zIndex: 1000,
    }

    const inputStyle: React.CSSProperties = {
        padding: '10px',
        margin: '10px 0',
        width: 'calc(100% - 22px)',
        boxSizing: 'border-box',
    }

    const buttonStyle: React.CSSProperties = {
        padding: '10px 20px',
        cursor: 'pointer',
        margin: '10px 0',
    }
    const errorMessageStyle: React.CSSProperties = {
        color: 'black',
        backgroundColor: '#ffe6e6',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '10px'
    }
    const fileOptions = {
        types: [
            {
                description: 'JSON files',
                accept: {
                    'text/plain': '.json' as `.${string}`,
                },
            },
        ],
    }
    const exportFile = async (jsonData: Record<string, any>) => {
        const jsonDataStr = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonDataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            const userResponse = window.prompt("Enter file name:", "output.json");
            if (userResponse !== null) {
                a.download = userResponse.trim() || 'output.json';

                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                URL.revokeObjectURL(url);
            }
        }
    };


    const handleSendPrompt = async () => {
        const formattedPrompt = prompt.trim()
        setErrorMessage('');
        setResponse('');
        setNodeCount('');
        if (!apiKey || !formattedPrompt) {
            alert('API Key and prompt are required.')
            return
        } else {
            const openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true,
            })

            const thread = await openai.beta.threads.create()

            // const message =
            await openai.beta.threads.messages.create(thread.id, {
                role: 'user',
                content: formattedPrompt,
            })

            let run = await openai.beta.threads.runs.create(thread.id, {
                assistant_id: assistantsapiKey,
            })

            let tries = 0
            while (run.status !== 'completed' && tries < 30) { // wait at most 30 seconds for the openAI run to complete
                tries += 1
                await new Promise((resolve) => setTimeout(resolve, 1000))
                run = await openai.beta.threads.runs.retrieve(
                    run.thread_id,
                    run.id
                )
            }

            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(
                    run.thread_id
                );
                console.log(messages.data[0])
                let parsedResponse;
                try {
                    parsedResponse = JSON.parse(
                        JSON.stringify(messages.data[0].content[0])
                    )
                    var jsonOutput = parsedResponse["text"]["value"]
                    setResponse(jsonOutput);
                    console.log("loading GPT output:", jsonOutput);
                    var finalOutput = JSON.parse(jsonOutput);
                    console.log("Node Count:", finalOutput["nodes"].length);
                    setNodeCount(finalOutput["nodes"].length);
                    exportFile(finalOutput);
                    await loadEditor(JSON.parse(jsonOutput));



                } catch (error: any) {
                    console.error("Error parsing response:", error);
                    setErrorMessage("Error parsing response: " + error.message);
                    return;
                }
            }
        }
    }

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
                style={{ ...inputStyle, height: '100px' }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleSendPrompt}>
                Send Prompt
            </button>
            <div style={{ color: 'black' }}>
                <p>
                    This feature is WIP. If you don't have the API keys don't
                    worry about it!
                </p>
            </div>
            {errorMessage && (
                <div style={errorMessageStyle}>
                    {errorMessage}
                </div>
            )}
            <div>
                <p style={{ color: "black" }}>Node Count: {nodeCount}</p>
                <p style={{ color: "black" }}>Response:</p>
                <pre id="json" style={{ color: "black" }}>{response}</pre>
            </div>


            {/* <div style={{'color': 'black'}}>
        <p>Response:</p>
        <p>{response}</p>
      </div> */}
        </div>
    )
};
export default GptChatInterface
