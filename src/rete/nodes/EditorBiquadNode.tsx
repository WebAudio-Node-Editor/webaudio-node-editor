import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'
import { DropdownControl } from '../controls/DropdownControl'

export class EditorBiquadNode extends Classic.Node<
    {
        signal: Classic.Socket
        frequency: Classic.Socket
        q: Classic.Socket
        gain: Classic.Socket
    },
    { signal: Classic.Socket },
    { filterType: DropdownControl }
> {
    width = 180
    height = 320
    cachedBiquadNode: BiquadFilterNode | null = null

    constructor(
        change: () => void,
        initial?: { freq: number; q: number; gain: number; filterType: string }
    ) {
        super('Biquad Filter')

        const liveUpdateFrequency = (value: number) => {
            if (this.cachedBiquadNode) {
                this.cachedBiquadNode.frequency.linearRampToValueAtTime(
                    value,
                    audioCtx.currentTime + 0.02
                )
            }
        }

        const liveUpdateQ = (value: number) => {
            if (this.cachedBiquadNode) {
                this.cachedBiquadNode.Q.linearRampToValueAtTime(
                    value,
                    audioCtx.currentTime + 0.02
                )
            }
        }

        const liveUpdateGain = (value: number) => {
            if (this.cachedBiquadNode) {
                this.cachedBiquadNode.gain.linearRampToValueAtTime(
                    value,
                    audioCtx.currentTime + 0.02
                )
            }
        }

        let signalInput = new Classic.Input(socket, 'Signal', true)
        this.addInput('signal', signalInput)

        let freqInput = new Classic.Input(socket, 'Filter frequency', true)
        freqInput.addControl(
            new LabeledInputControl(
                initial ? initial.freq : 350,
                'Filter frequency',
                change,
                50,
                false,
                liveUpdateFrequency,
                2 // round to 2 decimal places
            )
        )
        this.addInput('frequency', freqInput)

        let qInput = new Classic.Input(socket, 'Q', true)
        qInput.addControl(
            new LabeledInputControl(
                initial ? initial.q : 1,
                'Q',
                change,
                0.1,
                false,
                liveUpdateQ
            )
        )
        this.addInput('q', qInput)

        let gainInput = new Classic.Input(socket, 'Filter gain', true)
        gainInput.addControl(
            new LabeledInputControl(
                initial ? initial.gain : 0,
                'Filter gain',
                change,
                0.1,
                false,
                liveUpdateGain
            )
        )
        this.addInput('gain', gainInput)

        this.addOutput('signal', new Classic.Output(socket, 'Signal'))

        const dropdownOptions = [
            { value: 'lowpass', label: 'lowpass' },
            { value: 'highpass', label: 'highpass' },
            { value: 'bandpass', label: 'bandpass' },
            { value: 'lowshelf', label: 'lowshelf' },
            { value: 'highshelf', label: 'highshelf' },
            { value: 'peaking', label: 'peaking' },
            { value: 'notch', label: 'notch' },
            { value: 'allpass', label: 'allpass' },
        ]

        this.addControl(
            'filterType',
            new DropdownControl(
                change,
                dropdownOptions,
                initial ? initial.filterType : 'lowpass'
            )
        )
    }

    data(inputs: {
        signal?: AudioNode[]
        frequency?: AudioNode[]
        q?: AudioNode[]
        gain?: AudioNode[]
    }): { signal: AudioNode } {
        const bqNode = audioCtx.createBiquadFilter()
        this.cachedBiquadNode = bqNode

        const freqControl = this.inputs.frequency?.control
        const qControl = this.inputs.q?.control
        const gainControl = this.inputs.gain?.control

        if (inputs.signal) {
            inputs.signal.forEach((itm) => itm.connect(bqNode))
        }

        if (inputs.frequency) {
            bqNode.frequency.setValueAtTime(0, audioCtx.currentTime)
            inputs.frequency.forEach((itm) => itm.connect(bqNode.frequency))
        } else {
            bqNode.frequency.setValueAtTime(
                (freqControl as LabeledInputControl).value || 350,
                audioCtx.currentTime
            )
        }

        if (inputs.q) {
            bqNode.Q.setValueAtTime(0, audioCtx.currentTime)
            inputs.q.forEach((itm) => itm.connect(bqNode.Q))
        } else {
            bqNode.Q.setValueAtTime(
                (qControl as LabeledInputControl).value || 1,
                audioCtx.currentTime
            )
        }

        if (inputs.gain) {
            bqNode.gain.setValueAtTime(0, audioCtx.currentTime)
            inputs.gain.forEach((itm) => itm.connect(bqNode.gain))
        } else {
            bqNode.gain.setValueAtTime(
                (gainControl as LabeledInputControl).value || 0,
                audioCtx.currentTime
            )
        }

        bqNode.type = this.controls.filterType.value as BiquadFilterType

        return {
            signal: bqNode,
        }
    }

    serialize() {
        return {
            freq: (this.inputs.frequency?.control as LabeledInputControl).value,
            q: (this.inputs.q?.control as LabeledInputControl).value,
            gain: (this.inputs.gain?.control as LabeledInputControl).value,
            filterType: this.controls.filterType.value as string,
        }
    }
}
