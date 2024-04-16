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
        x_transpose: LabeledInputControl
        timeVisualizer: VisualizerControl
        freqVisualizer: VisualizerControl
        visual: DropdownControl
        dynamicCompressor: DropdownControl
    }
> {
    width = 400
    height = 460
    public timeAnalyserNode = audioCtx.createAnalyser()
    public freqAnalyserNode = audioCtx.createAnalyser()

    constructor(
        change: () => void,
        initial?: { gain: number; visual: string; x_transpose: number; dynamicCompressor: string }
    ) {
        super('Universal Output')

        this.addInput('signal', new Classic.Input(socket, 'Signal', true))
        this.addControl(
            'gain',
            new LabeledInputControl(
                initial ? initial.gain : 1,
                'Gain',
                change,
                0.1
            )
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
        const dropdownOptionsVisual = [
            { value: 'linear', label: 'Linear X-axis' },
            { value: 'log', label: 'Log X-axis' },
        ]

        const dropdownOptionsCompressor = [
            { value: 'default', label: 'Default Compressor' },
            { value: 'node', label: 'No Compressor' },
        ]

        this.addControl('visual', new DropdownControl(change, dropdownOptionsVisual))
        this.addControl('dynamicCompressor', new DropdownControl(change, dropdownOptionsCompressor))
        //Make the dropdown larger

        //For transposing the x axis
        //- Adrian Cardenas
        // this.addControl(
        //     'x_transpose',
        //     new LabeledInputControl(
        //         initial? initial.x_transpose : 0, 'Transpose Frequency Axis', change
        //     )
        // )
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
        this.controls.freqVisualizer.display_linear =
            di_linear?.localeCompare('linear') === 0


        //if default is on
        if(this.controls.dynamicCompressor.value?.toString() == "default"){

            const compressor = audioCtx.createDynamicsCompressor()
            inputs.signal?.forEach((itm) => itm.connect(compressor))

        }

        

        //Inputting Range Parameters
        // this.controls.freqVisualizer.x_transpose = parseFloat(this.controls.x_transpose.value?.toString())
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
