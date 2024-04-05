import { Connection, Context } from './default'
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
import { ConsoleDebuggerNode } from './nodes/ConsoleDebuggerNode'
import {
    KeyboardADSRNode,
    KeyboardNoteNode,
} from './nodes/KeyboardOscillatorNode'
import { EditorDelayNode } from './nodes/EditorDelayNode'

export async function createNode(
    { editor, area, dataflow, process }: Context,
    name: string,
    data: any
) {
    switch (name) {
        case 'Audio Output':
            return new AudioOutputNode(process)
        case 'Universal Output':
            if (isNaN(parseInt(data['gain']))) {
                throw new Error('Invalid gain')
            } else {
                return new UniversalOutputNode(process, data)
            }

        case 'Clip Signal':
            if (isNaN(parseInt(data['amp']))) {
                throw new Error('Invalid amplitude')
            } else {
                return new ClipNode(process, data)
            }

        case 'Biquad Filter':
            var validSettings = [
                'lowpass',
                'highpass',
                'bandpass',
                'lowshelf',
                'highshelf',
                'peaking',
                'notch',
                'allpass',
            ]
            if (!validSettings.includes(data['filterType'])) {
                throw new Error('Invalid filter option')
            } else if (isNaN(parseInt(data['q']))) {
                throw new Error('Invalid Q')
            } else if (!Number.isInteger(data['freq'])) {
                throw new Error('Invalid frequency')
            } else {
                return new EditorBiquadNode(process, data)
            }

        case 'Constant':
            if (isNaN(parseInt(data['value']))) {
                throw new Error('Invalid gain')
            } else {
                return new EditorConstantNode(process, data)
            }
        case 'Gain':
            if (isNaN(parseInt(data['gain']))) {
                throw new Error('Invalid gain')
            } else {
                return new EditorGainNode(process, data)
            }

        case 'Delay':
            if (!Number.isInteger(data['delay'])) {
                throw new Error('Invalid delay')
            } else if (!Number.isInteger(data['maxDelay'])) {
                throw new Error('Invalid max delay')
            } else {
                return new EditorDelayNode(process, data)
            }

        case 'Noise':
            console.log('noise')
            console.log(data)
            var noiseTypes = [
                'White Noise',
                'Brown Noise',
                'Pink Noise',
                'Violet Noise',
                'Blue Noise',
                'Grey Noise',
                'Velvet Noise',
            ]
            if (!noiseTypes.includes(data['noiseType'])) {
                throw new Error('Invalid noise type')
            } else {
                return new EditorNoiseNode(process, data)
            }
        case 'Oscillator':
            var validWaveforms = ['sine', 'sawtooth', 'triangle', 'square']
            if (!validWaveforms.includes(data['waveform'])) {
                throw new Error('Not a valid waveform')
            } else if (!Number.isInteger(data['baseFreq'])) {
                throw new Error('Invalid frequency')
            } else {
                return new EditorOscillatorNode(process, data)
            }
        case 'Note Frequency':
            console.log('Note freq')
            console.log(data)
            if (isNaN(parseInt(data['octave']))) {
                throw new Error('Invalid octave')
            }
            if (isNaN(parseInt(data['note']))) {
                throw new Error('Invalid note')
            } else {
                return new NoteFrequencyNode(process, data)
            }
        case 'Transpose':
            return new TransposeNode(process, data)
        case 'Time Domain Visualizer':
            console.log('time domain')
            console.log(data)
            return new TimeDomainVisualizerNode()
        case 'Frequency Domain Visualizer':
            return new FrequencyDomainVisualizerNode(process, data)
        case 'Console Debugger':
            return new ConsoleDebuggerNode()
        case 'Keyboard Note':
            return new KeyboardNoteNode(process, data)
        case 'Keyboard ADSR':
            return new KeyboardADSRNode(process, data)
        default:
            throw new Error('Unsupported node')
    }
}

export async function importEditor(context: Context, data: any) {
    const { nodes, connections } = data
    const nodeIds = new Set(nodes.map((node: { id: string }) => node.id))
    for (const n of nodes) {
        const node = await createNode(context, n.name, n.data)
        node.id = n.id
        await context.editor.addNode(node)
    }
    for (const c of connections) {
        if (!nodeIds.has(c.source) || !nodeIds.has(c.target)) {
            console.error('Invalid connection: Node ID not found')
            continue
        }
        const source = context.editor.getNode(c.source)
        const target = context.editor.getNode(c.target)

        if (
            source &&
            target &&
            (source.outputs as any)[c.sourceOutput] &&
            (target.inputs as any)[c.targetInput]
        ) {
            const conn = new Connection(
                source,
                c.sourceOutput as never,
                target,
                c.targetInput as never
            )

            await context.editor.addConnection(conn)
        }
    }
}

export function exportEditor(context: Context) {
    const nodes = []
    const connections = []

    for (const n of context.editor.getNodes()) {
        nodes.push({
            id: n.id,
            name: n.label,
            data: n.serialize(),
        })
    }
    for (const c of context.editor.getConnections()) {
        connections.push({
            source: c.source,
            sourceOutput: c.sourceOutput,
            target: c.target,
            targetInput: c.targetInput,
        })
    }

    return {
        nodes,
        connections,
    }
}
