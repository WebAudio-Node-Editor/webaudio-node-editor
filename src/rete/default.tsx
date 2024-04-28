import { ClassicPreset as Classic, GetSchemes, NodeEditor } from 'rete'

import { Area2D, AreaPlugin, AreaExtensions } from 'rete-area-plugin'
import {
    ConnectionPlugin,
    Presets as ConnectionPresets,
} from 'rete-connection-plugin'

import {
    AutoArrangePlugin,
    Presets as ArrangePresets,
    ArrangeAppliers,
} from 'rete-auto-arrange-plugin'

import {
    ReactPlugin,
    ReactArea2D,
    //Presets as ReactPresets,
    Presets,
} from 'rete-react-plugin'
import { createRoot } from 'react-dom/client'

import { DataflowEngine } from 'rete-engine'
import {
    ContextMenuExtra,
    ContextMenuPlugin,
    Presets as ContextMenuPresets,
} from 'rete-context-menu-plugin'

import {
    HistoryExtensions,
    HistoryPlugin,
    Presets as HistoryPresets,
} from 'rete-history-plugin'

import {
    DropdownControl,
    CustomDropdownControl,
} from './controls/DropdownControl'
import {
    LabeledInputControl,
    CustomLabeledInputControl,
} from './controls/LabeledInputControl'
import {
    VisualizerControl,
    CustomVisualizerOutput,
} from './controls/VisualizerControl'
import { EditorOscillatorNode } from './nodes/EditorOscillatorNode'
import { EditorNoiseNode } from './nodes/EditorNoiseNode'
import { EditorGainNode } from './nodes/EditorGainNode'
import { DynamicsCompressorNode } from './nodes/DynamicsCompressorNode'
import { AudioOutputNode, UniversalOutputNode } from './nodes/AudioOutputNode'
import { EditorConstantNode } from './nodes/EditorConstantNode'
import {
    TimeDomainVisualizerNode,
    FrequencyDomainVisualizerNode,
} from './nodes/VisualizerNodes'
import { EditorBiquadNode } from './nodes/EditorBiquadNode'
import { ClipNode } from './nodes/ClipNode'
import { NoteFrequencyNode, TransposeNode } from './nodes/NoteFrequencyNode'

import {
    InputNodeStyle,
    ProcessorNodeStyle,
    OutputNodeStyle,
    SourceNodeStyle,
} from './styles/nodestyles'
import { DashedConnection } from './styles/connectionstyles'
import { SmoothZoom } from './smoothzoom'

import { importEditor, exportEditor } from './imports'
import { clearEditor } from './utils'
import { CustomSocket } from './styles/socketstyles'

import { CustomContextMenu } from './styles/contextstyles'
import { ConsoleDebuggerNode } from './nodes/ConsoleDebuggerNode'
import {
    KeyboardADSRNode,
    KeyboardNoteNode,
    initKeyboard,
    initKeyboardHandlers,
} from './nodes/KeyboardOscillatorNode'
import { EditorDelayNode } from './nodes/EditorDelayNode'

import defaultExample from './examples/default.json'
import amfmExample from './examples/amfm.json'
import jetEngineExample from './examples/jetengine.json'
import keyboardJetEngineExample from './examples/keyboardcontrolledjet.json'
import chordExample from './examples/chord.json'
import lofiSynthExample from './examples/lofisynth.json'
import gatedLofiExample from './examples/gatedlofisynth.json'

import {
    CommentPlugin,
    CommentExtensions,
    //FrameComment,
} from 'rete-comment-plugin'

const EPSILON = 0.0001

const examples: { [key in string]: any } = {
    'Default': {
        json: defaultExample,
        concepts:
            'Drag from socket to socket to create connections; right click for context menu. Try loading some examples to the left of this!',
    },
    'AM+FM Synthesis': {
        json: amfmExample,
        concepts: 'Synthesis, addition to base values',
    },
    'Jet Engine': {
        json: jetEngineExample,
        concepts:
            'Multiparameter control with one constant node, intermediate debugging with visualizer outputs',
    },
    'Keyboard Controlled Jet': {
        json: keyboardJetEngineExample,
        concepts:
            'Try pressing A! Uses a keyboard gain node to control the speed of the engine',
    },
    'Chord': { json: chordExample, concepts: 'Note frequency node' },
    'Lo-fi Synth': {
        json: lofiSynthExample,
        concepts:
            'Try pressing keyboard keys. Shift key acts as a sustain pedal.',
    },
    'Gated Lo-fi Synth': {
        json: gatedLofiExample,
        concepts:
            'Hold A to shift the mix between filtered and unfiltered notes.',
    },
}

type SourceNode =
    | EditorConstantNode
    | EditorOscillatorNode
    | EditorNoiseNode
    | NoteFrequencyNode

const sourceNodeTypes = [
    EditorConstantNode,
    EditorOscillatorNode,
    EditorNoiseNode,
    NoteFrequencyNode,
]

type ProcessorNode =
    | EditorGainNode
    | EditorBiquadNode
    | ClipNode
    | TransposeNode
    | EditorDelayNode
    | DynamicsCompressorNode

const processorNodeTypes = [
    EditorGainNode,
    EditorBiquadNode,
    ClipNode,
    TransposeNode,
    EditorDelayNode,
    DynamicsCompressorNode,
]

type InputNode = KeyboardNoteNode | KeyboardADSRNode

const inputNodeTypes = [KeyboardNoteNode, KeyboardADSRNode]

type OutputNode =
    | UniversalOutputNode
    | AudioOutputNode
    | TimeDomainVisualizerNode
    | FrequencyDomainVisualizerNode
    | ConsoleDebuggerNode

const outputNodeTypes = [
    UniversalOutputNode,
    AudioOutputNode,
    TimeDomainVisualizerNode,
    FrequencyDomainVisualizerNode,
    ConsoleDebuggerNode,
]

type Node = SourceNode | ProcessorNode | InputNode | OutputNode

type Conn = Connection<Node, Node>
export type Schemes = GetSchemes<Node, Conn>

export class Connection<
    A extends Node,
    B extends Node,
> extends Classic.Connection<A, B> {}

export type Context = {
    process: () => void
    editor: NodeEditor<Schemes>
    area: AreaPlugin<Schemes, any>
    dataflow: DataflowEngine<Schemes>
    comment: CommentPlugin<Schemes, any>
}

type AreaExtra = Area2D<Schemes> | ReactArea2D<Schemes> | ContextMenuExtra

export const socket = new Classic.Socket('socket')

export const audioCtx = new window.AudioContext()
export const globalGain = audioCtx.createGain()
// const globalCompressor = audioCtx.createDynamicsCompressor() //DELETE THIS
// globalGain.connect(globalCompressor).connect(audioCtx.destination)
globalGain.connect(audioCtx.destination)
export const audioSources: AudioScheduledSourceNode[] = []
export const audioSourceStates: boolean[] = []

function initAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume()
    } else {
        audioCtx.suspend()
    }
}

function reInitOscillators() {
    globalGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.1)
    for (let i = 0; i < audioSources.length; i++) {
        if (!audioSourceStates[i]) {
            audioSources[i].start()
            audioSourceStates[i] = true
        }
    }
}

function killOscillators() {
    for (let i = 0; i < audioSources.length; i++) {
        if (audioSourceStates[i]) {
            globalGain.gain.setValueAtTime(
                globalGain.gain.value,
                audioCtx.currentTime
            )
            globalGain.gain.linearRampToValueAtTime(
                EPSILON,
                audioCtx.currentTime + 0.1
            )  
            audioSources[i].stop(audioCtx.currentTime + 0.1)
            audioSourceStates[i] = false
        }
    }
    audioSources.length = 0
    audioSourceStates.length = 0
}

var processQueued = false
var reprocessQueued = false

export async function createEditor(container: HTMLElement) {
    const area = new AreaPlugin<Schemes, AreaExtra>(container)
    const editor = new NodeEditor<Schemes>()
    const engine = new DataflowEngine<Schemes>()
    const history = new HistoryPlugin<Schemes>()

    HistoryExtensions.keyboard(history)

    history.addPreset(HistoryPresets.classic.setup({ timing: 0.01 }))

    const comment = new CommentPlugin<Schemes, AreaExtra>()
    const selector = AreaExtensions.selector()
    const accumulating = AreaExtensions.accumulateOnCtrl()

    function process() {
        if (processQueued) {
            reprocessQueued = true
            return
        }
        processQueued = true
        engine.reset()

        killOscillators()
        initKeyboard()

        setTimeout(() => {
            editor
                .getNodes()
                .filter((n) => outputNodeTypes.some((itm) => n instanceof itm))
                .forEach((n) => engine.fetch(n.id))
            setTimeout(reInitOscillators, 100)
            setTimeout(() => {
                processQueued = false
                if (reprocessQueued) {
                    reprocessQueued = false
                    process()
                }
            }, 150)
        }, 50)
    }

    const connection = new ConnectionPlugin<Schemes, AreaExtra>()
    const reactRender = new ReactPlugin<Schemes, AreaExtra>({ createRoot })
    const arrange = new AutoArrangePlugin<Schemes>()
    arrange.addPreset(ArrangePresets.classic.setup())

    const applier = new ArrangeAppliers.TransitionApplier<Schemes, never>({
        duration: 500,
        timingFunction: (t) => t,
        async onTick() {
            await AreaExtensions.zoomAt(area, editor.getNodes())
        },
    })

    const contextMenu = new ContextMenuPlugin<Schemes>({
        items: ContextMenuPresets.classic.setup([
            ['Constant', () => new EditorConstantNode(process)],
            ['Oscillator', () => new EditorOscillatorNode(process)],
            [
                'Noise',
                () =>
                    new EditorNoiseNode(process, { noiseType: 'White Noise' }),
            ],
            [
                'Processors',
                [
                    ['Gain', () => new EditorGainNode(process)],
                    ['Biquad Filter', () => new EditorBiquadNode(process)],
                    ['Delay', () => new EditorDelayNode(process)],
                    ['Clip', () => new ClipNode(process)],
                    ['Dynamics Compressor', () => new DynamicsCompressorNode(process) ],
                ],
            ],
            [
                'Notes',
                [
                    ['Note Frequency', () => new NoteFrequencyNode(process)],
                    ['Transpose', () => new TransposeNode(process)],
                ],
            ],
            [
                'Keyboard Input',
                [
                    [
                        'Keyboard Oscillator',
                        () => new KeyboardNoteNode(process),
                    ],
                    ['Keyboard ADSR', () => new KeyboardADSRNode(process)],
                ],
            ],
            [
                'Outputs',
                [
                    [
                        'Universal Output',
                        () => new UniversalOutputNode(process),
                    ],
                    ['Audio Output', () => new AudioOutputNode(process)],
                    [
                        'Time Domain Visualizer',
                        () => new TimeDomainVisualizerNode(),
                    ],
                    [
                        'Frequency Domain Visualizer',
                        () => new FrequencyDomainVisualizerNode(process),
                    ],
                    ['Console Debugger', () => new ConsoleDebuggerNode()],
                ],
            ],
        ]),
    })

    editor.addPipe((context) => {
        if (['connectioncreated', 'connectionremoved'].includes(context.type)) {
            setTimeout(process, 10)
            //process();
        }
        return context
    })

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: {
            active: () => false,
        },
    })
    AreaExtensions.showInputControl(area)

    editor.use(area)
    editor.use(engine)

    area.use(reactRender)
    area.use(contextMenu)
    area.use(connection)
    area.use(arrange)
    area.use(comment)
    CommentExtensions.selectable(comment, selector, accumulating)
    area.use(history)

    area.area.setZoomHandler(
        new SmoothZoom(0.4, 200, 'cubicBezier(.45,.91,.49,.98)', area)
    )

    connection.addPreset(ConnectionPresets.classic.setup())
    reactRender.addPreset(
        Presets.classic.setup({
            customize: {
                control(data) {
                    if (data.payload instanceof VisualizerControl) {
                        return CustomVisualizerOutput
                    }
                    if (data.payload instanceof LabeledInputControl) {
                        return CustomLabeledInputControl
                    }
                    if (data.payload instanceof DropdownControl) {
                        return CustomDropdownControl
                    }
                    if (data.payload instanceof Classic.InputControl) {
                        return Presets.classic.Control
                    }
                    return null
                },
                node(context) {
                    if (
                        inputNodeTypes.some((c) => context.payload instanceof c)
                    ) {
                        return InputNodeStyle
                    }
                    if (
                        outputNodeTypes.some(
                            (c) => context.payload instanceof c
                        )
                    ) {
                        return OutputNodeStyle
                    }
                    if (
                        sourceNodeTypes.some(
                            (c) => context.payload instanceof c
                        )
                    ) {
                        return SourceNodeStyle
                    }
                    if (
                        processorNodeTypes.some(
                            (c) => context.payload instanceof c
                        )
                    ) {
                        return ProcessorNodeStyle
                    }
                    if (context.payload instanceof Classic.Node) {
                        return Presets.classic.Node
                    }
                    return null
                },
                connection(context) {
                    return DashedConnection
                },
                socket(context) {
                    return CustomSocket
                },
            },
        })
    )
    reactRender.addPreset(
        Presets.contextMenu.setup({ customize: CustomContextMenu, delay: 200 })
    )

    initKeyboardHandlers()

    const osc = new EditorOscillatorNode(process)
    const gain = new EditorGainNode(process, { gain: 0.5 })
    const output = new UniversalOutputNode(process)

    await editor.addNode(osc)
    await editor.addNode(gain)
    await editor.addNode(output)

    var c = new Connection<Node, Node>(
        osc,
        'signal' as never,
        gain,
        'signal' as never
    )

    await editor.addConnection(c)
    await editor.addConnection(
        new Connection<Node, Node>(
            gain,
            'signal' as never,
            output,
            'signal' as never
        )
    )

    await arrange.layout({ applier: undefined })
    AreaExtensions.zoomAt(area, editor.getNodes())

    await editor.removeConnection(c.id)

    //Clear history so tracking actions (for undo/redo)
    //start with user interactions not the loaded example.
    history.clear()

    process()

    const context: Context = {
        process: process,
        editor: editor,
        area: area,
        dataflow: engine,
        comment: comment,
    }

    async function loadEditor(data: any) {
        await clearEditor(editor)
        await clearComments()
        await importEditor(context, data)
        await arrange.layout({ applier: undefined })
        AreaExtensions.zoomAt(area, editor.getNodes())
    }
    async function loadExample(exampleName: string) {
        await loadEditor(examples[exampleName].json)

        //Clear history so tracking actions (for undo/redo)
        //start with user interactions not the loaded example.
        history.clear()
    }
    function GetExampleDescription(exampleName: string) {
        return examples[exampleName].concepts
    }
    async function saveEditor() {
        var data = exportEditor(context)
        await arrange.layout({ applier: undefined })
        AreaExtensions.zoomAt(area, editor.getNodes())
        return data
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
    const javascriptFileOption = {
        types: [
            {
                description: 'Javascript files',
                accept: {
                    'text/plain': '.js' as `.${string}`,
                },
            },
        ],
    }
    async function importEditorFromFile() {
        var fileHandle
        try {
            ;[fileHandle] = await window.showOpenFilePicker(fileOptions)
        } catch (e) {
            return
        }
        const file = await fileHandle.getFile()
        const contents = await file.text()
        await loadEditor(JSON.parse(contents))
    }
    async function exportEditorToFile() {
        var data = await saveEditor()
        async function getNewFileHandle() {
            const handle = await window.showSaveFilePicker(fileOptions)
            return handle
        }

        async function writeFile(fileHandle: any, contents: any) {
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable()
            // Write the contents of the file to the stream.
            await writable.write(contents)
            // Close the file and write the contents to disk.
            await writable.close()
        }

        try {
            var hdl = await getNewFileHandle()
        } catch (e) {
            return
        }
        writeFile(hdl, JSON.stringify(data))
    }

    async function exportEditorToJS() {
        var json = await saveEditor()
        //Node interfaces from JSON file
        interface OscillatorNodeData {
            baseFreq: string;
            waveform: string;
          }
          
        interface GainNodeData {
            gain: string;
        }
        interface NoiseNodeData {
            noiseType: string;
        }
        interface ConstantData {
            value: string;
        }
        interface BiquadFilterData {
            freq: string;
            q: string;
            gain: string;
            filterType: string;
        }
        interface DelayNodeData {
            delay: string;
            maxDelay: string;
        }
        interface ClipNodeData {
            amp: string;
        }
        interface NoteNodeData {
            octave: string;
            note: string;
        }
        interface TransposeNodeData {
            octave: string;
            halfstep: string;
        }
        let nodes = new Map();
        let nodeIDNum = 0
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();
        let todayStr = mm + '-' + dd + '-' + yyyy;
        let code = "//WAVIRCodeVersionDate: " + todayStr + "\n\n";
        code = code.concat("var audioCtx = new (window.AudioContext || window.webkitAudioContext)();\n")
        for (const node of json.nodes) {
            let audioNode = true;
            let newCode = "";
            let nodeID = String(nodeIDNum)
            let nodeName = ''
            switch (node.name) {
                case "Oscillator":
                    nodeName = `osc${nodeID}`
                    const oscillatorData = node.data as OscillatorNodeData;
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createOscillator();\n")
                    newCode = newCode.concat(nodeName,".frequency.setValueAtTime(", oscillatorData.baseFreq, ", audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".type = '", oscillatorData.waveform, "';\n")
                    newCode = newCode.concat(nodeName,".start();\n")
                    break;
                case "Gain":
                    nodeName = `gainNode${nodeID}`
                    const gainData = node.data as GainNodeData;
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createGain();\n")
                    newCode = newCode.concat(nodeName,".gain.setValueAtTime(", gainData.gain, ", audioCtx.currentTime);\n")
                    break;
                case "Noise":
                    nodeName = `noiseNode${nodeID}`
                    newCode = newCode.concat("const ", nodeName, "= audioCtx.createBufferSource();\n")
                    newCode = newCode.concat("var bufferSize = 10 * audioCtx.sampleRate\n")
                    newCode = newCode.concat("var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)\n")
                    newCode = newCode.concat("var output = noiseBuffer.getChannelData(0)\n")
                    newCode = newCode.concat("var bufferSize = 10 * audioCtx.sampleRate\n")
                    const noiseData = node.data as NoiseNodeData;
                    let noiseType = noiseData.noiseType
                    if (noiseType === 'White Noise') {
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1 }\n")
                    } else if (noiseType === 'Brown Noise') {
                        newCode = newCode.concat("var lastOut = 0\n")
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) {\n")
                        newCode = newCode.concat("var brown = Math.random() * 2 - 1\n")
                        newCode = newCode.concat("output[i] = (lastOut + 0.02 * brown) / 1.02\n")
                        newCode = newCode.concat("lastOut = output[i]\n")
                        newCode = newCode.concat("output[i] *= 3.5\n")
                        newCode = newCode.concat("}\n")
                    } else if (noiseType === 'Pink Noise') { 
                        newCode = newCode.concat("let b0, b1, b2, b3, b4, b5, b6\n")
                        newCode = newCode.concat("b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0\n")
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) {\n")
                        newCode = newCode.concat("let white = Math.random() * 2 - 1\n")
                        newCode = newCode.concat("b0 = 0.99886 * b0 + white * 0.0555179\n")
                        newCode = newCode.concat("b1 = 0.99332 * b1 + white * 0.0750759\n")
                        newCode = newCode.concat("b2 = 0.969 * b2 + white * 0.153852\n")
                        newCode = newCode.concat("b3 = 0.8665 * b3 + white * 0.3104856\n")
                        newCode = newCode.concat("b4 = 0.55 * b4 + white * 0.5329522\n")
                        newCode = newCode.concat("b5 = -0.7616 * b5 - white * 0.016898\n")
                        newCode = newCode.concat("output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362\n")
                        newCode = newCode.concat("output[i] *= 0.11")
                        newCode = newCode.concat("b6 = white * 0.115926\n")
                        newCode = newCode.concat("}")
                    } else if (noiseType === 'Blue Noise') { 
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1 }\n")
                        newCode = newCode.concat("let alpha = 0.1\n")
                        newCode = newCode.concat("let previousValue = 0\n")
                        newCode = newCode.concat("for (let i = 1; i < bufferSize; i++) {\n")
                        newCode = newCode.concat("output[i] = alpha * (output[i] - previousValue) + output[i - 1]\n")
                        newCode = newCode.concat("previousValue = output[i]\n")
                        newCode = newCode.concat("}")
                    } else if (noiseType === 'Violet Noise') { 
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1 }\n")
                        newCode = newCode.concat(" for (let i = bufferSize - 1; i > 0; i--) { output[i] = output[i] - output[i - 1]}\n")
                    } else if (noiseType === 'Grey Noise') { 
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1 }\n")
                        newCode = newCode.concat("let previousValue = 0\n")
                        newCode = newCode.concat("const smoothingFactor = 0.02\n")
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) {\n")
                        newCode = newCode.concat("output[i] = smoothingFactor * output[i] + (1 - smoothingFactor) * previousValue\n")
                        newCode = newCode.concat("previousValue = output[i]\n")
                        newCode = newCode.concat("}\n")
                    } else if (noiseType === 'Velvet Noise') {
                        newCode = newCode.concat("for (let i = 0; i < bufferSize; i++) { output[i] = 0 }\n")
                        newCode = newCode.concat("const impulseDensity = 100\n")
                        newCode = newCode.concat("const numberOfImpulses = Math.floor(bufferSize / impulseDensity)\n")
                        newCode = newCode.concat("for (let i = 0; i < numberOfImpulses; i++) {\n")
                        newCode = newCode.concat("const position = Math.floor(Math.random() * bufferSize)\n")
                        newCode = newCode.concat("output[position] = Math.random() * 2 - 1\n")
                        newCode = newCode.concat("}\n")
                    }
                    newCode = newCode.concat(nodeName,".buffer = noiseBuffer \n", nodeName,".loop = true\n")
                    newCode = newCode.concat(nodeName,".start()\n")
                    break;
                case "Constant":
                    nodeName = `constant${nodeID}`
                    const constantData = node.data as ConstantData;
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createConstantSource();\n")
                    newCode = newCode.concat(nodeName,".offset.setValueAtTime(",constantData.value,", audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".start()\n")
                    break
                case "Biquad Filter":
                    nodeName = `biquadFilterNode${nodeID}`
                    const biquadFilterData = node.data as BiquadFilterData;
                    newCode = newCode.concat("const ", nodeName, "= audioCtx.createBiquadFilter()\n")
                    newCode = newCode.concat(nodeName,".frequency.setValueAtTime(", biquadFilterData.freq, ", audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".Q.setValueAtTime(", biquadFilterData.q, ", audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".gain.setValueAtTime(", biquadFilterData.gain, ", audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".type = '", biquadFilterData.filterType, "'\n")
                    break
                case "Delay":
                    nodeName = `delayNode${nodeID}`
                    const delayNodeData = node.data as DelayNodeData;
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createDelay(Math.max(", delayNodeData.maxDelay, ", 1))\n")
                    newCode = newCode.concat(nodeName, ".delayTime.setValueAtTime(",delayNodeData.delay, ", audioCtx.currentTime)\n")
                    break;
                case "Clip Signal":
                    let gainName = `clipGainNode${nodeID}`
                    const clipNodeData = node.data as ClipNodeData
                    newCode = newCode.concat("const ", gainName, " = audioCtx.createGain()\n")
                    newCode = newCode.concat(gainName,".gain.value = 1 /", clipNodeData.amp,"\n")
                    nodeName = `clipWaveNode${nodeID}`
                    newCode = newCode.concat("const ", nodeName, " = new WaveShaperNode(audioCtx, { curve: new Float32Array([-",clipNodeData.amp,", ",clipNodeData.amp,"]),})\n")
                    newCode = newCode.concat(gainName, ".connect(",nodeName,")\n")
                    break;
                case "Note Frequency":
                    nodeName = `noteNode${nodeID}`
                    const noteNodeData = node.data as NoteNodeData
                    newCode = newCode.concat("const ", nodeName, " = audioCtx.createConstantSource()\n")
                    newCode = newCode.concat("const noteVal", nodeID," = Number(",noteNodeData.note,")\n");
                    newCode = newCode.concat("const octave", nodeID, " = ", noteNodeData.octave, " || 0\n")
                    newCode = newCode.concat("const val", nodeID," = 261.625565300598634 * Math.pow(2.0, octave", nodeID," - 4 + (1.0 / 12) * noteVal", nodeID,")\n")
                    newCode = newCode.concat(nodeName, ".offset.setValueAtTime(val",nodeID, ", audioCtx.currentTime)\n")
                    newCode = newCode.concat(nodeName,".start()\n")
                    break;
                case "Transpose":
                    nodeName = `transposeGainNode${nodeID}`
                    const transposeNodeData = node.data as TransposeNodeData
                    newCode = newCode.concat("const halfstep", nodeID, " = ", transposeNodeData.halfstep, " || 0\n")
                    newCode = newCode.concat("const octave", nodeID, " = ", transposeNodeData.octave, " || 0\n")
                    newCode = newCode.concat("const tranposeGainNode", nodeID, " = audioCtx.createGain()\n")
                    newCode = newCode.concat("const val",nodeID, " = Math.pow(2.0, octave", nodeID," + (1.0 / 12) * halfstep", nodeID,")\n")
                    newCode = newCode.concat("transposeGainNode",nodeID,".gain.value = val", nodeID, "\n")
                    break;
                case "Universal Output":
                    nodeName = `outputNode${nodeID}`
                    const universalGainData = node.data as GainNodeData;
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createGain();\n")
                    newCode =newCode.concat(nodeName,".gain.setValueAtTime(", universalGainData.gain,",audioCtx.currentTime);\n")
                    newCode = newCode.concat(nodeName,".connect(audioCtx.destination);\n")
                    break;
                case "Audio Output":
                    nodeName = `audioOutputNode${nodeID}`
                    newCode = newCode.concat("const ", nodeName," = audioCtx.createGain();\n")
                    newCode = newCode.concat(nodeName,".connect(audioCtx.destination);\n")
                    break;
                case "Frequency Domain Visualizer":
                    continue;
                case "Time Domain Visualizer":
                    continue;
                default:
                    audioNode = false
                    alert("Unsupported node type: " +node.name+"");
                    return;

            }
            code = code.concat(newCode, "\n")
            if (audioNode) {
                nodes.set(node.id, nodeName);
                nodeIDNum += 1
            }
    
        }
        const connectionsDict = {
            "signal": "",
            "baseGain":".gain",
            "additionalGain":".gain",
            "baseFrequency":".frequency",
            "frequency":".frequency",
            "q":".Q",
            "gain":".gain",
            "delayTime": ".delayTime"
            
        }
        // fix biquad node filterFrequency, is it now frequency
        //maybe check if its frequency and not a biquad node
        var seenNodeInputs = [["empty", "empty"]]
        json.connections.forEach(conn => {
            const sourceNode = nodes.get(conn.source);
            let targetNode = nodes.get(conn.target);
            const connInputType = conn.targetInput
            const connCodeType = connectionsDict[conn.targetInput]
            
            if (!targetNode || !sourceNode){
                return;
            }
            if (targetNode.includes("clip")) {
                targetNode = "clipGainNode"+targetNode.slice(12)
            }

            const nodeInput = [targetNode, connInputType]
            if (!seenNodeInputs.some(element => //only set a connection input to 0 once, incase of multiple connections to one input
                nodeInput.length === element.length && nodeInput.every((value, index) => value === element[index]))) {
                if (connInputType === "baseFrequency" || (connInputType === "frequency" && targetNode.includes("biquad"))) {
                    code = code.concat(targetNode, ".frequency.setValueAtTime(0, audioCtx.currentTime)\n")
                } else if (connInputType === "baseGain" || connInputType === "gain") {
                    code = code.concat(targetNode, ".gain.setValueAtTime(0, audioCtx.currentTime)\n")
                } else if (connInputType === "q") {
                    code = code.concat(targetNode, ".Q.setValueAtTime(0, audioCtx.currentTime)\n")
                } else if (connInputType === "delayTime") {
                    code = code.concat(targetNode, ".delayTime.setValueAtTime(0, audioCtx.currentTime)\n")
                }
                seenNodeInputs.push(nodeInput)
            }
            if (sourceNode && targetNode) {
                code = code.concat(sourceNode,".connect(",targetNode, connCodeType,");\n")
            } else {
                console.log("Connection failed. Node not found.");
            }
        });
        code = code.concat("audioCtx.resume();")

        async function getNewFileHandle() {
            const handle = await window.showSaveFilePicker(javascriptFileOption)
            return handle
        }

        async function writeFile(fileHandle: any, contents: any) {
            const writable = await fileHandle.createWritable()
            await writable.write(contents)
            await writable.close()
        }

        try {
            var hdl = await getNewFileHandle()
        } catch (e) {
            return
        }
        writeFile(hdl, code)
    }

    function toggleAudio() {
        initAudio()
        process()
    }
    function undo() {
        history.undo()
    }
    function redo() {
        history.redo()
    }

    function clear() {
        clearEditor(editor)
        clearComments()
    }
    function clearComments() {
        comment.clear()
    }

    function createComment(commentType: string) {
        if (commentType === 'Frame') {
            comment.addFrame('Frame', [])
            console.log(comment.comments)
        } else {
            comment.addInline('Inline', [0, 0])
        }
    }

    function deleteComment() {
        var comments = Array.from(comment.comments.entries())
        for (let i = 0; i < comments.length; i++) {
            console.log(i)
            console.log(comments[i])
            var id = '1'
            var label = 'comment'
            if (selector.isSelected({ id, label })) {
                comment.delete(id)
            }
        }
    }
    return {
        layout: async (animate: boolean) => {
            await arrange.layout({ applier: animate ? applier : undefined })
            AreaExtensions.zoomAt(area, editor.getNodes())
        },
        exportEditorToFile,
        exportEditorToJS,
        importEditorFromFile,
        clearEditor: () => clear(),
        destroy: () => {
            killOscillators()
            initKeyboard()
            area.destroy()
        },
        getExamples() {
            return Object.keys(examples)
        },
        loadExample,
        loadEditor,
        toggleAudio,
        createComment,
        deleteComment,
        clearComments,
        undo,
        redo,
        GetExampleDescription,
    }
}
