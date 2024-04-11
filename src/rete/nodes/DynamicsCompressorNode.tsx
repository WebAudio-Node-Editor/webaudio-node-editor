import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class DynamicsCompressorNode extends Classic.Node<
    {
        signalInput: Classic.Socket
        exampleInputWithControl: Classic.Socket
    },
    { signalOutput: Classic.Socket },
    { threshold: LabeledInputControl 
      knee: LabeledInputControl
      ratio: LabeledInputControl
      reduction: LabeledInputControl
      attack: LabeledInputControl
      release: LabeledInputControl
    }
> {
    width = 220
    height = 500

    // The change argument is a function that should be called whenever a value changes
    // We generally use it to trigger reevaluating the graph when a value is changed
    constructor(
        change: () => void,
        initial?: { threshold: number , knee: number, ratio: number}
    ) {
        // This is the node's label that shows up in the editor
        super('Dynamics Compressor')

        /*  This is an input socket
            Arguments are: 
                socket - ignore, just always pass in this or Classic.Socket
                label - the text label that shows up over this socket
                multipleConnections - whether the socket should accept more than one connection;
                                      defaults false
        */
        let signalInput = new Classic.Input(socket, 'Signal', true)
        this.addInput('signalInput', signalInput) // The string arg here MUST match the names from before
        // Note that we could have done this as a one-liner, like for the output example

        // This is an output socket
        this.addOutput('signalOutput', new Classic.Output(socket, 'Signal'))

        /*  This is a control: some kind of non-socket object on your node
            Here, it's a number entry field with a label. This is a custom control; the default
            Rete InputControl has no label.
            Arguments:
                value: The initial value
                label: The label above the input field
                change (nullable): Called when the value changes
                readonly: Whether the field should be readonly or not (defaults false)
        */
        this.addControl(
            'threshold',
            new LabeledInputControl(
                initial ? initial.threshold : 0,
                'threshold',
                change,
                99,
                false
            )
        )

        this.addControl(
            'knee',
            new LabeledInputControl(
                initial ? initial.knee : 0,
                'knee',
                change,
                99,
                false
            )
        )

        this.addControl(
            'ratio',
            new LabeledInputControl(
                initial ? initial.ratio : 0,
                'ratio',
                change,
                99,
                false
            )
        )
        
        //Reduction
        this.addControl(
            'reduction',
            new LabeledInputControl(
                initial ? initial.ratio : 0,
                'reduction',
                change,
                99,
                false
            )
        )

        //Attack
        this.addControl(
            'attack',
            new LabeledInputControl(
                initial ? initial.ratio : 0,
                'attack',
                change,
                99,
                false
            )
        )

        //Release
        this.addControl(
            'release',
            new LabeledInputControl(
                initial ? initial.ratio : 0,
                'release',
                change,
                99,
                false
            )
        )

    }

    // The data method is called by the engine to evaluate nodes
    // It's where the inputs are processed to create output(s)
    data(inputs: {
        exampleInput: AudioNode[]
        exampleInputWithControl: AudioNode[]
    }): { exampleOutput: AudioNode } {
        // The inputs are all lists of AudioNodes because a socket generally may have multiple inputs
        // Even if the socket is not a multiple connection socket, they must be defined as a list
        // All socket outputs should be a single AudioNode!!!

        const gainNode = audioCtx.createGain()


        // Connect input nodes to this node
        inputs.exampleInput?.forEach((itm) => itm.connect(gainNode))

        return {
            exampleOutput: gainNode,
        }
    }

    // This stores the values in our node in JSON format, used for import/export to reinitialize the node
    serialize() {
        return {
            threshold: (
                this.controls.threshold as LabeledInputControl
            ).value,
            knee: (
                this.controls.knee as LabeledInputControl
            ).value,
        }
    }
}
