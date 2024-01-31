import { Layout, Flex, Divider } from 'antd'
import { Link } from 'react-router-dom'
import './Blog.css'

export default function Documentation() {
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
                    <div className="Blog-header">Input behavior</div>
                    <div className="Blog-content">
                        When an input (with a socket) also has an editable
                        field, such as the Base Frequency field of an oscillator
                        node, adding a connection to the socket will{' '}
                        <i>overwrite</i> the value in the editable field.
                    </div>
                    <div className="Blog-content">
                        When multiple signals are connected to a single socket,
                        they add <i>additively</i>. That means if you pass two
                        signals with values 300 and 500 into the Additional
                        Frequency field of an oscillator node, the additional
                        frequency will be 300+500=800.
                    </div>
                    <div className="Blog-header">
                        Frequency Signals vs Audio Signals
                    </div>
                    <div className="Blog-content">
                        Some inputs produce signals that are intended to be
                        interpreted as frequencies; these signals should
                        therefore find their way to the frequency field of an
                        oscillator at some point. Of course, it is valid to not
                        use them this way, but the results might not be useful!
                    </div>
                    <div className="Blog-content">
                        Note that audio signals can also be interpreted as
                        frequencies. However, because audio signals are
                        typically in the [-1, 1] range, you will often have to
                        pass them through a gain node to use them in this way.
                        See the AM+FM synthesis example for an example of how
                        this is done.
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
                </Layout>
            </Layout>
        </div>
    )
}
