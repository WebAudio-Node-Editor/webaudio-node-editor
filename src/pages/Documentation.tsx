import { Layout, Flex, Divider } from 'antd'
import { Link } from 'react-router-dom'
import './Blog.css'
import React from 'react'

export default function Documentation() {
    class DocumentContent extends React.Component {
        state = {
            active: 'basicUsage',
        }

        updateState(newState: string) {
            this.setState({ active: newState })
        }

        render() {
            return (
                <div>
                    <Layout
                        style={{
                            margin: '10px 10px',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div
                                className={
                                    this.state.active === 'basicUsage'
                                        ? 'Blog-nav-active'
                                        : 'Blog-nav'
                                }
                                onClick={() => this.updateState('basicUsage')}
                            >
                                Basic Usage
                            </div>
                            <div
                                className={
                                    this.state.active === 'nodes'
                                        ? 'Blog-nav-active'
                                        : 'Blog-nav'
                                }
                                onClick={() => this.updateState('nodes')}
                            >
                                Node Types
                            </div>
                            <div
                                className={
                                    this.state.active === 'keyboard'
                                        ? 'Blog-nav-active'
                                        : 'Blog-nav'
                                }
                                onClick={() => this.updateState('keyboard')}
                            >
                                Keyboard
                            </div>
                        </div>
                    </Layout>

                    <div
                        style={{
                            display:
                                this.state.active === 'basicUsage'
                                    ? 'block'
                                    : 'none',
                        }}
                    >
                        <Layout className="Block container">
                            <div className="Block-header">What is this?</div>
                            <div className="Block-content">
                                This is a node-based editor for WebAudio created
                                using Rete.js, a Javascript framework for visual
                                programming through node editors. Node editors
                                are widely used in shader editors and even game
                                programming (as in Unreal Engine's Blueprints).
                            </div>
                        </Layout>

                        <Layout className="Block container">
                            <div
                                className="Block-header"
                                style={{ marginBottom: '20px' }}
                            >
                                Basic Usage
                            </div>
                            <div className="row" style={{ margin: '0px' }}>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Create Connections: </b> Click + drag
                                        from socket to socket.
                                    </div>
                                    <img
                                        src={require('../images/Connecting Nodes.gif')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Create New Nodes: </b> Right click on
                                        empty space to open the context menu
                                    </div>
                                    <img
                                        src={require('../images/Adding Nodes.gif')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                            </div>
                            <div className="row" style={{ margin: '0px' }}>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Delete Nodes: </b> Right-click on a
                                        node
                                    </div>
                                    <img
                                        src={require('../images/Deleting Nodes.gif')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Organize Nodes: </b> Click the
                                        "Auto-Arrange" button in the upper right
                                        corner
                                    </div>
                                    <img
                                        src={require('../images/Arrange Nodes.gif')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                            </div>
                        </Layout>
                        <div className="row">
                            <Layout className="container Half-block">
                                <div className="Block-header">
                                    Input Behavior
                                </div>
                                <div className="Block-content">
                                    When an input (with a socket) also has an
                                    editable field, such as the Base Frequency
                                    field of an oscillator node, adding a
                                    connection to the socket will{' '}
                                    <b>overwrite the value</b> in the editable
                                    field.
                                </div>
                                <div className="Block-content">
                                    When multiple signals are connected to a
                                    single socket, <b>they add additively</b>.
                                    That means if you pass two signals with
                                    values 300 and 500 into the Additional
                                    Frequency field of an oscillator node, the
                                    additional frequency will be 300+500=800.
                                </div>
                            </Layout>

                            <Layout className="container Half-block">
                                <div className="Block-header">
                                    Frequency vs. Audio Signals
                                </div>
                                <div className="Block-content">
                                    Some inputs produce signals that are
                                    intended to be interpreted as frequencies;
                                    these signals should therefore find their
                                    way to the frequency field of an oscillator
                                    at some point.
                                </div>
                                <div className="Block-content">
                                    Of course, it is valid to not use them this
                                    way, but the results might not be useful!
                                </div>
                                <div className="Block-content">
                                    Audio signals can also be interpreted as
                                    frequencies. However, because audio signals
                                    are typically in the [-1, 1] range, you will
                                    often have to pass them through a gain node
                                    to use them in this way. See the AM+FM
                                    synthesis example for an example of how this
                                    is done.
                                </div>
                            </Layout>
                        </div>
                    </div>

                    <div
                        style={{
                            display:
                                this.state.active === 'nodes'
                                    ? 'block'
                                    : 'none',
                        }}
                    >
                        <Layout className="Block container">
                            <div className="Block-header">Basic Nodes</div>
                            <div className="row" style={{ margin: '0px' }}>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Audio Sources</b>
                                    </div>
                                    <div className="Block-content">
                                        The first source of signals within your
                                        graph. Without them, no signal will be
                                        present to propagate through your nodes
                                        and connections.
                                    </div>
                                    <img
                                        src={require('../images/Audio_Sources.png')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Processors</b>
                                    </div>
                                    <div className="Block-content">
                                        These nodes take in a signal, modify it
                                        somehow, and pass the modified signal
                                        through. They're typically just like
                                        their WebAudio versions.
                                    </div>
                                    <img
                                        src={require('../images/Processors.png')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                            </div>
                            <Divider
                                type="horizontal"
                                style={{
                                    top: '10px',
                                    height: '20px',
                                    borderColor: 'white',
                                }}
                            ></Divider>
                            <div className="row" style={{ margin: '0px' }}>
                                <div className="Half-block">
                                    <div className="Block-content">
                                        <b>Outputs</b>
                                    </div>
                                    <div className="Block-content">
                                        The end points of your signals. Without
                                        being connected to an output (whether
                                        directly or indirectly), your signals
                                        won't have any perceivable effect.
                                    </div>
                                    <div className="Block-content">
                                        Visualizers let you see what the
                                        signal's like, and audio outputs let you
                                        hear it. The Universal Output node
                                        combines both visualizers, and audio
                                        output, and a gain node. In addition to
                                        their normal function, these nodes are
                                        also useful for debugging your signal.
                                    </div>
                                </div>
                                <div className="Half-block">
                                    <img
                                        src={require('../images/Outputs.png')}
                                        alt="Adding Nodes"
                                        width="100%"
                                    />
                                </div>
                            </div>
                        </Layout>

                        <Layout className="Block container">
                            <div className="Block-header">Advanced Nodes</div>
                            <div className="Block-content">
                                <div
                                    className="row"
                                    style={{ margin: '20px 0px' }}
                                >
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Note_Freq.png')}
                                            alt="Adding Nodes"
                                            width="35%"
                                        />
                                        <div style={{ marginLeft: '30px' }}>
                                            <div className="Block-content">
                                                <b>Note Frequency</b>
                                            </div>
                                            <div className="Block-content">
                                                This node is a special case of a
                                                constant signal node. It outputs
                                                a constant signal with a value
                                                equal to the frequency of the
                                                specified note.
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Delay.png')}
                                            alt="Adding Nodes"
                                            width="30%"
                                        />
                                        <div style={{ marginLeft: '30px' }}>
                                            <div className="Block-content">
                                                <b>Delay</b>
                                            </div>
                                            <div className="Block-content">
                                                Delays the output. Not useful
                                                unless using it along with
                                                keyboard input.
                                            </div>
                                            <div className="Block-content">
                                                "Max delay" parameter must be
                                                set higher than the maximum
                                                possible delay in your graph.{' '}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="row"
                                    style={{ margin: '20px 0px' }}
                                >
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Transpose.png')}
                                            alt="Adding Nodes"
                                            width="40%"
                                            height="75%"
                                        />
                                        <div style={{ marginLeft: '20px' }}>
                                            <div className="Block-content">
                                                <b>Transpose</b>
                                            </div>
                                            <div className="Block-content">
                                                Takes in a frequency signal and
                                                outputs an appropriately scaled
                                                frequency signal corresponding
                                                to the specified transposition.
                                                1 octave = 12 half-steps.{' '}
                                            </div>
                                            <div className="Block-content">
                                                <b>
                                                    This node won’t work
                                                    properly on audio signals
                                                </b>{' '}
                                                - it will scale the signal
                                                amplitude, not frequency.{' '}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Console_Debug.png')}
                                            alt="Adding Nodes"
                                            width="35%"
                                            height="30%"
                                        />
                                        <div style={{ marginLeft: '20px' }}>
                                            <div className="Block-content">
                                                <b>Console Debugger</b>
                                            </div>
                                            <div className="Block-content">
                                                Outputs the input to your
                                                browser's console. Use this to
                                                get an extra fine look at what's
                                                going on.
                                            </div>
                                            <div className="Block-content">
                                                However, note that WebAudio
                                                nodes don't actually provide any
                                                way to look at the intermediate
                                                nodes of an audio set-up, so the
                                                Console Debugger Node should be
                                                attached as close to the point
                                                of interest as possible.{' '}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Layout>
                    </div>

                    <div
                        style={{
                            display:
                                this.state.active === 'keyboard'
                                    ? 'block'
                                    : 'none',
                        }}
                    >
                        <Layout className="Block container">
                            <div className="Block-header">Keyboard Nodes</div>
                            <div className="Block-content">
                                <div
                                    className="row"
                                    style={{ margin: '20px 0px' }}
                                >
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Keyboard_Note.png')}
                                            alt="Adding Nodes"
                                            width="25%"
                                        />
                                        <div style={{ marginLeft: '30px' }}>
                                            <div className="Block-content">
                                                <b>Note</b>
                                            </div>
                                            <div className="Block-content">
                                                The Keyboard Note node allows
                                                you to play notes from your
                                                keyboard!
                                            </div>
                                            <div className="Block-content">
                                                Range: C4 to C6, but can be
                                                transposed as a whole. Use its
                                                built-in controls to do so.
                                            </div>
                                            <div className="Block-content">
                                                Each note's ADSR envelope's
                                                heights and interval lengths can
                                                be adjusted via the controls on
                                                the node.
                                            </div>
                                            <div className="Block-content">
                                                Amplitudes will ramp
                                                exponentially to each other over
                                                time (though this sounds linear
                                                to the human ear).
                                            </div>
                                            <div className="Block-content">
                                                Clicking artifacts may occur.
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="Half-block"
                                        style={{ display: 'inline-flex' }}
                                    >
                                        <img
                                            src={require('../images/Keyboard_ASDR.png')}
                                            alt="Adding Nodes"
                                            width="30%"
                                        />
                                        <div style={{ marginLeft: '40px' }}>
                                            <div className="Block-content">
                                                <b>ASDR</b>
                                            </div>
                                            <div className="Block-content">
                                                Like the Keyboard Note node but
                                                with one individual ADSR
                                                envelope separated out. This
                                                node lets you attach an ADSR
                                                envelope to anything, not just
                                                the preset notes of the Keyboard
                                                Note node.
                                            </div>
                                            <div className="Block-content">
                                                In theory, it is possible to
                                                create the Keyboard Note node by
                                                combining oscillators and these
                                                nodes; building the keyboard
                                                "from fundamentals" in this way
                                                is more flexible.
                                            </div>
                                            <div className="Block-content">
                                                Check out the Keyboard
                                                Controlled Jet or Gated Lo-fi
                                                Synth examples to see this node
                                                in action.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Layout>
                    </div>
                </div>
            )
        }
    }

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
                    <Link to="/documentation" className="App-header">
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

                <DocumentContent />

                {/*
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
                        Blueprints).
                    </div>
                    <div className="Blog-header">Basic Usage</div>
                    <div className="Blog-content">
                        Drag from socket to socket to create connections between
                        nodes.
                        <br />
                        Right click on empty space to open the context menu,
                        letting you create new nodes.
                        <br />
                        Right click on a node to open the context menu, letting
                        you delete the node.
                        <br />
                        Use the auto-arrange button in the upper right to stay
                        organized.
                    </div>

                    <div className="Blog-header">Basic Nodes</div>
                    <div className="Blog-content">
                        The most essential nodes fall into three categories:
                        <br />
                        - Audio Sources: These are your oscillators, noise
                        nodes, and constants. They are the first source of
                        signals within your graph. Without them, no signal will
                        be present propagate through your nodes and connections.
                        <br />
                        - Processors: Filters, gain nodes, and the like. These
                        nodes take in a signal, modify it somehow, and pass the
                        modified signal through. They're typically just like
                        their WebAudio versions.
                        <br />- Outputs: The end points of your signals. Without
                        being connected to an output (whether directly or
                        indirectly), your signals won't have any perceivable
                        effect. Visualizers let you see what the signal's like,
                        and audio outputs let you hear it. The Universal Output
                        node combines both visualizers, and audio output, and a
                        gain node. In addition to their normal function, these
                        nodes are also useful for debugging your signal.
                    </div>
                    <div className="Blog-header">Advanced Nodes</div>
                    <div className="Blog-subheader">Note Frequency</div>
                    <div className="Blog-content">
                        This node is a special case of a constant signal node.
                        It outputs a constant signal with a value equal to the
                        frequency of the specified note.
                    </div>
                    <div className="Blog-subheader">Transpose</div>
                    <div className="Blog-content">
                        This node takes in a <i>frequency</i> signal and outputs
                        an appropriately scaled frequency signal corresponding
                        to the specified transposition. Note that one octave is
                        equal to twelve halfsteps.
                    </div>
                    <div className="Blog-content">
                        The transpose node <i>will not</i> work properly on
                        audio signals - it will scale the amplitude of the
                        signal, not the frequency.
                    </div>
                    <div className="Blog-subheader">Delay</div>
                    <div className="Blog-content">
                        This node simply delays the output. This isn't really
                        useful unless you're using it along with keyboard input.
                        Note that the "max delay" parameter must be set at least
                        higher than the maximum possible delay in your graph -
                        this is for memory allocation reasons.
                    </div>
                    <div className="Blog-subheader">Console Debugger</div>
                    <div className="Blog-content">
                        This node outputs the input to your browser's console.
                        Use this to get an extra fine look at what's going on.
                        However, note that WebAudio nodes don't actually provide
                        any way to look at the connected nodes of an AudioNode,
                        so the Console Debugger Node should be attached as
                        closely to the point of interest as possible.
                        <br />
                        For example, if you have an oscillator feeding into a
                        gain node, if you attach this node to the gain node, you
                        will not be able to see the oscillator in the console.
                        This node should instead be attached to the oscillator
                        directly.
                    </div>
                    <div className="Blog-header">Keyboard Note</div>
                    <div className="Blog-content">
                        The Keyboard Note node allows you to play notes from
                        your keyboard. By default, the notes range from C4 to
                        C6, but they can be transposed as a whole via the
                        controls on the node. Note that the output signal is an
                        audio signal and transposition nodes will not work
                        properly on the output of this node (so use its built-in
                        controls!).
                    </div>
                    <div className="Blog-content">
                        Each note's ADSR envelope's heights and interval lengths
                        can be adjusted via the controls on the node. Amplitudes
                        will ramp exponentially to each other over time (though
                        this sounds linear to the human ear). Note that
                        depending on your settings, clicking artifacts may
                        occur.
                    </div>
                    <div className="Blog-header">Keyboard ADSR</div>
                    <div className="Blog-content">
                        This is like the Keyboard Note node but with one
                        individual ADSR envelope separated out. In theory, it is
                        possible to create the Keyboard Note node by combining
                        oscillators and these nodes; building the keyboard "from
                        fundamentals" in this way is theoretically more
                        flexible. This node lets you basically attach an ADSR
                        envelope to anything, not just the preset notes of the
                        Keyboard Note node.
                    </div>
                    <div className="Blog-content">
                        One example of this is the Keyboard Controlled Jet
                        example. The constant controlling everything
                        (representing the speed of the engine) is now linked to
                        a Keyboard ADSR node, letting the keypress dictate a
                        transition from low to high speed.
                    </div>
                    <div className="Blog-content">
                        Another example is in the Gated Lo-fi Synth example.
                        Now, pressing A affects the mix between the lowpassed
                        and nonfiltered signal, through the use of a Keyboard
                        ADSR node.
                    </div>
                </Layout> */}
            </Layout>
        </div>
    )
}
