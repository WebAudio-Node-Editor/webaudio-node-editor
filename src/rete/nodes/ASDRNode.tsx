import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class ASDRNode extends Classic.Node<
    { signal: Classic.Socket; trigger: Classic.Socket },
    { signal: Classic.Socket },
    {
        attack: Classic.InputControl<'number', number>
        delay: Classic.InputControl<'number', number>
        sustain: Classic.InputControl<'number', number>
        release: Classic.InputControl<'number', number>
    }
> {
    width = 180
    height = 500
    constructor(
        change: () => void,
        initial?: {
            attack: number
            delay: number
            sustain: number
            release: number
        }
    ) {
        super('ASDR')

        let signalInput = new Classic.Input(socket, 'Signal', true)
        this.addInput('signal', signalInput)

        let triggerInput = new Classic.Input(socket, 'Trigger', false)
        this.addInput('trigger', triggerInput)

        this.addControl(
            'attack',
            new LabeledInputControl(
                initial ? initial.attack : 1,
                'Attack',
                change
            )
        )
        this.addControl(
            'delay',
            new LabeledInputControl(
                initial ? initial.delay : 1,
                'Delay',
                change
            )
        )
        this.addControl(
            'sustain',
            new LabeledInputControl(
                initial ? initial.sustain : 0.5,
                'Sustain',
                change
            )
        )
        this.addControl(
            'release',
            new LabeledInputControl(
                initial ? initial.release : 0.5,
                'Release',
                change
            )
        )

        this.addOutput('signal', new Classic.Output(socket, 'Signal'))
    }

    data(inputs: { signal?: AudioNode[]; trigger?: AudioNode[] }): {
        signal: AudioNode
        value: boolean
    } {
        const gainNode = audioCtx.createGain()
        const attack = this.controls.attack.value || 0.1
        const delay = this.controls.delay.value || 0.1
        const sustain = this.controls.sustain.value || 0.1
        const release = this.controls.release.value || 0.1

        if (inputs.trigger && inputs.trigger.length > 0) {
            const trigger = inputs.trigger[0]
            trigger.connect(gainNode.gain)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            gainNode.gain.linearRampToValueAtTime(
                1,
                audioCtx.currentTime + attack
            )
            gainNode.gain.linearRampToValueAtTime(
                sustain,
                audioCtx.currentTime + attack + delay
            )
            gainNode.gain.linearRampToValueAtTime(
                0,
                audioCtx.currentTime + attack + delay + release
            )
        }

        inputs.signal?.forEach((itm) => itm.connect(gainNode))

        return {
            signal: gainNode,
            value: true,
        }
    }

    serialize() {
        return {
            attack: this.controls.attack.value,
            delay: this.controls.delay.value,
            sustain: this.controls.sustain.value,
            release: this.controls.release.value,
        }
    }
}
