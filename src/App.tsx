import React, { useEffect, useState } from 'react'
import { useRete } from 'rete-react-plugin'
import './App.css'
import './rete.css'
import { createEditor } from './rete'
import { Layout, Button, Flex, Select, Divider, Dropdown } from 'antd'
import { Link } from 'react-router-dom'
import { FaRedo, FaUndo } from 'react-icons/fa'
import GptChatInterface from './gptChatInterface'

let selectedExample = 'Default'

function App() {
    const [ref, editor]: readonly [any, any] = useRete(createEditor)
    const [examples, setExamples] = useState<string[]>([])
    const [concepts, setConcepts] = useState<string>('Placeholder')
    const [showChat, setShowChat] = useState(false)

    window.addEventListener('keydown', function (event) {
        const key = event.key
        if (key === 'Backspace' || key === 'Delete') {
            editor?.deleteComment()
        }
    })

    const items = [
        {
            key: '1',
            label: (
                <div
                    style={{ color: '#A7AFB2' }}
                    onClick={() => editor?.createComment('Inline')}
                >
                    Create Inline Comment
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <div
                    style={{ color: '#A7AFB2' }}
                    onClick={() => editor?.createComment('Frame')}
                >
                    Create Frame Comment
                </div>
            ),
        },
        {
            key: '3',
            label: (
                <div
                    style={{ color: '#A7AFB2' }}
                    onClick={() => editor?.deleteComment()}
                >
                    Delete Selected Comment
                </div>
            ),
        },
        {
            key: '4',
            label: (
                <div
                    style={{ color: '#A7AFB2' }}
                    onClick={() => editor?.clearComments()}
                >
                    Clear Comments
                </div>
            ),
        },
    ]
    useEffect(() => {
        if (editor) {
            const list = editor.getExamples()
            setExamples(list)
            setConcepts(editor.GetExampleDescription(list[0]))
        }
    }, [editor])

    return (
        <Layout
            style={{
                display: 'flex',
                height: '100vh',
                backgroundImage:
                    'linear-gradient(to bottom right, CornflowerBlue, Pink)',
            }}
        >
            <Flex
                gap="small"
                className="header"
                align="center"
                style={{
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    height: '46px',
                    padding: '0.5em 1em',
                    position: 'absolute',
                    top: '0px',
                    width: '100%',
                    zIndex: '1',
                }}
            >
                <Link to="/" className="App-header">
                    Wavir
                </Link>
                <Divider
                    type="vertical"
                    style={{
                        top: '0px',
                        height: '20px',
                        borderLeft: '2px solid rgba(255,255,255,0.4)',
                    }}
                ></Divider>
                <Link to="/blog" className="App-link">
                    Blog
                </Link>
                <Divider
                    type="vertical"
                    style={{
                        top: '0px',
                        height: '20px',
                        borderLeft: '2px solid rgba(255,255,255,0.4)',
                    }}
                ></Divider>
                <Link to="/documentation" className="App-link">
                    Documentation
                </Link>
                <Divider
                    type="vertical"
                    style={{
                        top: '0px',
                        height: '20px',
                        borderLeft: '2px solid rgba(255,255,255,0.4)',
                    }}
                ></Divider>
                <a
                    className="App-link"
                    href="https://github.com/WebAudio-Node-Editor/webaudio-node-editor"
                    target="_blank"
                    rel="noreferrer"
                >
                    GitHub
                </a>
                <div style={{ flexGrow: 1 }} />
                <Button
                    style={{ border: 'none' }}
                    onClick={() => editor?.undo()}
                >
                    <FaUndo className={`${'icon-button'}`} />
                </Button>
                <Button
                    style={{ border: 'none' }}
                    onClick={() => editor?.redo()}
                >
                    <FaRedo className={`${'icon-button'}`} />
                </Button>
                <Dropdown
                    menu={{
                        items,
                    }}
                    arrow
                >
                    <Button>Comments</Button>
                </Dropdown>
                <Button onClick={() => editor?.layout(true)}>
                    Auto-arrange nodes
                </Button>
                <Button danger onClick={() => editor?.toggleAudio()}>
                    Toggle Audio
                </Button>
                <Button onClick={() => setShowChat(!showChat)}>
                    {showChat ? 'Hide LLM Chat' : 'Show LLM Chat'}
                </Button>
                {showChat && (
                    <GptChatInterface loadEditor={editor?.loadEditor} />
                )}
            </Flex>

            <div
                ref={ref}
                style={{
                    position: 'absolute',
                    top: '0px',
                    height: '100%',
                    width: '100%',
                    color: 'white',
                }}
            />

            <Flex
                gap="small"
                className="header"
                align="center"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '0.5em 1em',
                    position: 'absolute',
                    bottom: '0px',
                    width: '100%',
                    zIndex: '1',
                }}
            >
                <Select
                    defaultValue="Default"
                    options={examples.map((exampleName: string) => ({
                        label: exampleName,
                        value: exampleName,
                    }))}
                    style={{ width: 200 }}
                    onChange={(value) => {
                        selectedExample = value
                        setConcepts(editor?.GetExampleDescription(value))
                    }}
                />
                <Button onClick={() => editor.loadExample(selectedExample)}>
                    Load Example
                </Button>
                <div style={{ color: 'white' }}>{concepts}</div>
                <div style={{ flexGrow: 1 }} />
                <Button onClick={() => editor?.importEditorFromFile()}>
                    Import from file
                </Button>
                <Button onClick={() => editor?.exportEditorToFile()}>
                    Export to file
                </Button>
                <Button onClick={() => editor?.exportEditorToJS()}>
                    Export to code
                </Button>
                <Button danger onClick={() => editor?.clearEditor()}>
                    Clear
                </Button>
            </Flex>
        </Layout>
    )
}

export default App
