import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class ClipNode extends Classic.Node<
    { signal: Classic.Socket },
    { signal: Classic.Socket },
    { amp: LabeledInputControl }
> {
    width = 180
    height = 175
    constructor(change: () => void, initial?: { amp: number }) {
        super('Clip Signal')

        let signalInput = new Classic.Input(socket, 'Signal', true)
        this.addInput('signal', signalInput)

        this.addControl(
            'amp',
            new LabeledInputControl(
                initial ? initial.amp : 1,
                'Amplitude cutoff',
                change,
                0.1
            )
        )

        this.addOutput('signal', new Classic.Output(socket, 'Signal'))
    }

    data(inputs: { signal?: AudioNode[] }): { signal: AudioNode } {
        const amp = this.controls.amp.value || 1

        const gain = audioCtx.createGain()
        gain.gain.value = 1 / amp
        const waveShaper = new WaveShaperNode(audioCtx, {
            curve: new Float32Array([-amp, amp]),
        })
        gain.connect(waveShaper)

        inputs.signal?.forEach((sig) => sig.connect(gain))

        return {
            signal: waveShaper,
        }
    }

    serialize() {
        return {
            amp: this.controls.amp.value,
        }
    }
}
