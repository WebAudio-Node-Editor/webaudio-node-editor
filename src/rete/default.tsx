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
const EPSILON = .0001

import {
    CommentPlugin,
    CommentExtensions,
    //FrameComment,
} from 'rete-comment-plugin'

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

const processorNodeTypes = [
    EditorGainNode,
    EditorBiquadNode,
    ClipNode,
    TransposeNode,
    EditorDelayNode,
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
const globalCompressor = audioCtx.createDynamicsCompressor()
globalGain.connect(globalCompressor).connect(audioCtx.destination)
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
    globalGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + .05)
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
            globalGain.gain.setValueAtTime(globalGain.gain.value, audioCtx.currentTime);
            globalGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + .05);
            audioSources[i].stop(audioCtx.currentTime + .05);
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
            comment.addFrame('Frame', ['1'])
            console.log(comment.comments)
        } else {
            comment.addInline('Inline', [0, 0], '1')
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
        toggleAudio,
        createComment,
        deleteComment,
        clearComments,
        undo,
        redo,
        GetExampleDescription,
    }
}
