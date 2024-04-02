import { Layout, Flex, Divider } from 'antd'
import { Link } from 'react-router-dom'
import './Blog.css'

export default function Blog() {
    return (
        <div
            style={{
                overflow: 'auto',
                backgroundImage:
                    'linear-gradient(to bottom right, CornflowerBlue, Pink)',
                backgroundAttachment: 'fixed',
                zIndex: '-1',
            }}
        >
            {/* <div style={{width: '100vw', height: '100vh', backgroundImage: "linear-gradient(to bottom right, CornflowerBlue, Pink)", position: "sticky", top: "0px", zIndex: "-1"}}/> */}
            <Layout
                style={{
                    display: 'flex',
                    height: '100vh',
                    backgroundColor: 'transparent',
                }}
            >
                <Flex
                    gap="small"
                    className="header"
                    align="center"
                    style={{
                        color: 'white',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        padding: '0.5em 1em',
                        height: '46px',
                        width: '100%',
                        zIndex: '1',
                    }}
                >
                    <Link to="/" className="App-link">
                        WebAudio Node Editor
                    </Link>
                    <Divider
                        type="vertical"
                        style={{
                            top: '0px',
                            height: '20px',
                            borderLeft: '2px solid rgba(255,255,255,0.4)',
                        }}
                    ></Divider>
                    <Link to="/blog" className="App-header">
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
                </Flex>
                <Layout
                    style={{
                        display: 'flex',
                        width: '75%',
                        overflow: 'auto',
                        margin: 'auto',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        padding: '0em 2em',
                    }}
                >
                    <div className="Blog-subheader">
                        <a
                            className="Blog-link"
                            href="https://youtu.be/TkXoJeamk2c"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Video Demo
                        </a>
                    </div>
                    <div className="Blog-header">What is this?</div>
                    <div className="Blog-content">
                        This is a node-based editor for WebAudio created using{' '}
                        <a
                            className="Blog-link"
                            href="https://retejs.org/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Rete.js
                        </a>
                        , a Javascript framework for visual programming through
                        node editors. Node editors are widely used in shader
                        editors and even game programming (as in Unreal Engine's
                        Blueprints). Having used node editors for Blender and
                        other software, I wanted to take a stab at making my own
                        node editor for WebAudio, since I found that I really
                        missed having something like this while working on the
                        homework for this class.
                    </div>
                    <div className="Blog-content">
                        Note: this has only been fully tested in Google Chrome.
                        I know some things don't work in Firefox, and I'm not
                        sure about other browsers.
                    </div>
                    <div className="Blog-header">Current Status</div>
                    <div className="Blog-content">
                        This project is currently being developed by a group of
                        students to further improve the user experience and
                        introduce features like LLM node generation and new node
                        types.
                    </div>
                    <div className="Blog-content">
                        New features since group development began include:
                        <br />
                        - Undo/Redo
                        <br />
                        - Comments
                        <br />
                        - More noise types
                        <br />- Various UX improvements
                    </div>
                    <div className="Blog-header">Upcoming features</div>
                    <div className="Blog-content">
                        - Node to play audio files
                        <br />
                        - Native LLM node generation
                        <br />
                        - UX overhaul
                        <br />
                        - JS code export
                        <br />- And more!
                    </div>
                </Layout>
            </Layout>
        </div>
    )
}
