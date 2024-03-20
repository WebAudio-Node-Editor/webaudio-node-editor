import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { VisualizerControl } from '../controls/VisualizerControl'

import { LabeledInputControl } from '../controls/LabeledInputControl'
import { DropdownControl } from '../controls/DropdownControl'

export class TimeDomainVisualizerNode extends Classic.Node<
    { signal: Classic.Socket },
    {},
    { 
        visualizer: VisualizerControl
     }
> {
    width = 400
    height = 200
    public analyserNode = audioCtx.createAnalyser()
    constructor() {
        super('Time Domain Visualizer')

        this.addInput('signal', new Classic.Input(socket, 'Signal', true))
        this.addControl(
            'visualizer',
            new VisualizerControl(this.analyserNode, false)
        )

        
    }

    data(inputs: { signal?: AudioNode[] }): { value: AnalyserNode } {
        if (inputs.signal) {
            inputs.signal.forEach((itm) => itm.connect(this.analyserNode))
        }
        return {
            value: this.analyserNode,
        }
    }

    serialize() {
        return {}
    }
}

export class FrequencyDomainVisualizerNode extends Classic.Node<
    { signal: Classic.Socket },
    {},
    { visualizer: VisualizerControl
        visual: DropdownControl
        x_transpose: LabeledInputControl
    }
> {
    width = 400
    height = 240
    public analyserNode = audioCtx.createAnalyser()
    constructor( change: () => void,
        initial?: {visual: string; x_transpose: number}
        ) {
        super('Frequency Domain Visualizer')

        this.addInput('signal', new Classic.Input(socket, 'Signal', true))
        this.addControl(
            'visualizer',
            new VisualizerControl(this.analyserNode, true)
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

        // //Based on Adrian Cardenas's Code from AudioOutputNode
        // this.addControl(
        //     'x_transpose',
        //     new LabeledInputControl(
        //         initial? initial.x_transpose : 0, 'Transpose Frequency Axis', change
        //     )
        // )
        
    }

    data(inputs: { signal?: AudioNode[] }): { value: AnalyserNode } {
        if (inputs.signal) {
            inputs.signal.forEach((itm) => itm.connect(this.analyserNode))
        }

        //Visualizer Control Change
        // - Pedro Perez
        var di_linear = this.controls.visual.value?.toString()
        this.controls.visualizer.display_linear = (di_linear?.localeCompare("linear") === 0)

        //Inputting Range Parameters
        this.controls.visualizer.x_transpose = parseFloat(this.controls.x_transpose.value?.toString())

        return {
            value: this.analyserNode,
        }
    }

    serialize() {
        return {}
    }
}
