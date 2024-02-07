import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class NodeTemplate extends Classic.Node<
    {
        exampleInput: Classic.Socket
        exampleInputWithControl: Classic.Socket
    },
    { exampleOutput: Classic.Socket },
    { exampleControl: LabeledInputControl }
> {
    width = 180
    height = 200

    // The change argument is a function that should be called whenever a value changes
    // We generally use it to trigger reevaluating the graph when a value is changed
    constructor(
        change: () => void,
        initial?: { exampleInitialVal: number; exampleInitialVal2: number }
    ) {
        // This is the node's label that shows up in the editor
        super('NodeTemplate')

        /*  This is an input socket
            Arguments are: 
                socket - ignore, just always pass in this or Classic.Socket
                label - the text label that shows up over this socket
                multipleConnections - whether the socket should accept more than one connection;
                                      defaults false
        */
        let exInput = new Classic.Input(socket, 'Example Input Label', true)
        this.addInput('exampleInput', exInput) // The string arg here MUST match the names from before
        // Note that we could have done this as a one-liner, like for the output example

        /* This is an input socket that alternatively takes a manually entered input value
         instead of a node connection */
        let exInputWithControl = new Classic.Input(
            socket,
            'Another Label',
            false
        )
        exInputWithControl.addControl(
            new LabeledInputControl(
                initial ? initial.exampleInitialVal : 0, // initial value of this control
                'Another Label', // Label should ideally match the label of the input it's being attached to
                change
            )
        )
        this.addInput('exampleInputWithControl', exInputWithControl)

        // This is an output socket
        this.addOutput('exampleOutput', new Classic.Output(socket, 'Signal'))

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
            'exampleControl',
            new LabeledInputControl(
                initial ? initial.exampleInitialVal2 : 0,
                'control label',
                change,
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
        const gainControl = this.inputs['exampleInputWithControl']?.control

        // Connect input nodes to this node
        inputs.exampleInput?.forEach((itm) => itm.connect(gainNode))

        // Now let's set the gain on our gain node
        if (inputs.exampleInputWithControl) {
            // If there's any connections, ignore the value in the input field (which gets hidden)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
            inputs.exampleInputWithControl.forEach((itm) =>
                itm.connect(gainNode.gain)
            )
        } else {
            // Otherwise, use the value in the input field
            gainNode.gain.setValueAtTime(
                (gainControl as LabeledInputControl).value || 0,
                audioCtx.currentTime
            )
        }

        return {
            exampleOutput: gainNode,
        }
    }

    // This stores the values in our node in JSON format, used for import/export to reinitialize the node
    serialize() {
        return {
            exampleInitialVal: (
                this.inputs.exampleInputWithControl
                    ?.control as LabeledInputControl
            ).value,
            exampleInitialVal2: (
                this.controls.exampleControl as LabeledInputControl
            ).value,
        }
    }
}
