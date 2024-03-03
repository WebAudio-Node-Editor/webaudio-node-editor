import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { VisualizerControl } from '../controls/VisualizerControl'

import { LabeledInputControl } from '../controls/LabeledInputControl'
import { DropdownControl } from '../controls/DropdownControl'

export class TimeDomainVisualizerNode extends Classic.Node<
    { signal: Classic.Socket },
    {},
    { visualizer: VisualizerControl }
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
        visual: DropdownControl}
> {
    width = 400
    height = 200
    public analyserNode = audioCtx.createAnalyser()
    constructor( change: () => void,
        initial?: {visual: string}
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
        
    }

    data(inputs: { signal?: AudioNode[] }): { value: AnalyserNode } {
        if (inputs.signal) {
            inputs.signal.forEach((itm) => itm.connect(this.analyserNode))
        }

        //Visualizer Control Change
        // - Pedro Perez
        var di_linear = this.controls.visual.value?.toString()
        this.controls.visualizer.display_linear = (di_linear?.localeCompare("linear") === 0)

        return {
            value: this.analyserNode,
        }
    }

    serialize() {
        return {}
    }
}
