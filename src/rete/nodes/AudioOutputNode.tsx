import { ClassicPreset as Classic } from 'rete'
import { socket, globalGain, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'
import { VisualizerControl } from '../controls/VisualizerControl'
import { DropdownControl } from '../controls/DropdownControl'

export class AudioOutputNode extends Classic.Node<
    { signal: Classic.Socket },
    {},
    {}
> {
    width = 180
    height = 80
    constructor(change: () => void) {
        super('Audio Output')

        this.addInput('signal', new Classic.Input(socket, 'Signal', true))

    }

    data(inputs: { signal?: AudioNode[] }): { value: boolean } {
        let val = false
        if (inputs.signal) {
            val = true
            inputs.signal.forEach((itm) => itm.connect(globalGain))
        }
        return {
            value: val,
        }
    }

    serialize() {
        return {}
    }


    
}

export class UniversalOutputNode extends Classic.Node<
    { signal: Classic.Socket },
    {},
    {
        gain: LabeledInputControl
        range_min: LabeledInputControl
        range_max: LabeledInputControl
        timeVisualizer: VisualizerControl
        freqVisualizer: VisualizerControl
        visual: DropdownControl
    }
> {
    width = 400
    height = 540
    public timeAnalyserNode = audioCtx.createAnalyser()
    public freqAnalyserNode = audioCtx.createAnalyser()

    constructor(
        change: () => void, 
        initial?: { gain: number; visual: string , range_min: number, range_max: number}
        ) {
        super('Universal Output')

        this.addInput('signal', new Classic.Input(socket, 'Signal', true))
        this.addControl(
            'gain',
            new LabeledInputControl(initial ? initial.gain : 1, 'Gain', change)
        )

        this.addControl(
            'timeVisualizer',
            new VisualizerControl(this.timeAnalyserNode, false)
        )
        this.addControl(
            'freqVisualizer',
            new VisualizerControl(this.freqAnalyserNode, true)
        )

        //For chaning the dropdown
        //- Pedro Perez
        const dropdownOptions = [
            { value: 'linear', label: 'Linear X-axis' },
            { value: 'log', label: 'Log X-axis' },
        ]

        this.addControl(
            'visual',
            new DropdownControl(
                change,
                dropdownOptions,
            )
        )

        //For changing the range
        //- Adrian Cardenas
        this.addControl(
            'range_min',
            new LabeledInputControl(
                initial? initial.range_min : -100, 'Graph Min', change
            )
        )

        this.addControl(
            'range_max',
            new LabeledInputControl(
                initial? initial.range_min : -10, 'Graph Max', change
            )
        )
        
    }

    data(inputs: { signal?: AudioNode[] }): { value: boolean } {
        const gain = audioCtx.createGain()
        gain.gain.value = this.controls.gain.value

        let val = false
        if (inputs.signal) {
            val = true
            inputs.signal.forEach((itm) => itm.connect(gain))
        }
        gain.connect(globalGain)
        gain.connect(this.timeAnalyserNode)
        gain.connect(this.freqAnalyserNode)

        //Visualizer Control Change
        // - Pedro Perez
        var di_linear = this.controls.visual.value?.toString()
        this.controls.freqVisualizer.display_linear = (di_linear?.localeCompare("linear") === 0)
        return {
            value: val,
        }


    }

    serialize() {
        return {
            gain: this.controls.gain.value,
        }
    }
}
