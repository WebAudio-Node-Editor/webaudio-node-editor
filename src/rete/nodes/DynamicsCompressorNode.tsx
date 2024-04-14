import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx } from '../default'
import { LabeledInputControl } from '../controls/LabeledInputControl'

export class DynamicsCompressorNode extends Classic.Node<
    {
        signal: Classic.Socket
    },
    { signal: Classic.Socket },
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
        this.addInput('signal', signalInput) // The string arg here MUST match the names from before
        // Note that we could have done this as a one-liner, like for the output example

        // This is an output socket
        this.addOutput('signal', new Classic.Output(socket, 'Signal'))

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
                initial ? initial.threshold : -24,
                'Threshold',
                change,
                1,
                false
            )
        )

        this.addControl(
            'knee',
            new LabeledInputControl(
                initial ? initial.knee : 30,
                'Knee',
                change,
                1,
                false
            )
        )

        this.addControl(
            'ratio',
            new LabeledInputControl(
                initial ? initial.ratio : 12,
                'Ratio',
                change,
                1,
                false
            )
        )
        
        //Reduction
        this.addControl(
            'reduction',
            new LabeledInputControl(
                initial ? initial.ratio : 0,
                'Reduction',
                change,
                1,
                false
            )
        )

        //Attack
        this.addControl(
            'attack',
            new LabeledInputControl(
                initial ? initial.ratio : .003,
                'Attack',
                change,
                .001,
                false
            )
        )

        //Release
        this.addControl(
            'release',
            new LabeledInputControl(
                initial ? initial.ratio : 0.25,
                'Release',
                change,
                0.01,
                false
            )
        )

    }

    // The data method is called by the engine to evaluate nodes
    // It's where the inputs are processed to create output(s)
    data(inputs: {
        signal: AudioNode[]
    }): { signal: AudioNode } {
        // The inputs are all lists of AudioNodes because a socket generally may have multiple inputs
        // Even if the socket is not a multiple connection socket, they must be defined as a list
        // All socket outputs should be a single AudioNode!!!

        const compressor = audioCtx.createDynamicsCompressor()

        //Set Values
        
        
        //Threshold
        //threshold property's default value is -24 and it can be set between -100 and 0.
        
        //Knee
        //The knee property's default value is 30 and it can be set between 0 and 40.

        //Ratio
        //The ratio property's default value is 12 and it can be set between 1 and 20.

        //Reduction
        // it returns a value in dB, or 0 (no gain reduction) if no signal is fed into the DynamicsCompressorNode. 
        //The range of this value is between -20 and 0 (in dB).
        
        //Attack
        //The attack property's default value is 0.003 and it can be set between 0 and 1.
        // if(this.controls.attack){
        //     compressor.attack.setValueAtTime(this.controls.attack.value, audioCtx.currentTime)
        // }

        //Release
        //The release property's default value is 0.25 and it can be set between 0 and 1.
        // if(this.controls.release){
        //     compressor.release.setValueAtTime(this.controls.release.value, audioCtx.currentTime)
        // }




        inputs.signal?.forEach((itm) => itm.connect(compressor))

        //Set Values
        

        return {
            signal: compressor,
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
            ratio: (
                this.controls.ratio as LabeledInputControl
            ).value,
            reduction: (
                this.controls.reduction as LabeledInputControl
            ).value,
            attack: (
                this.controls.attack as LabeledInputControl
            ).value,
            release: (
                this.controls.release as LabeledInputControl
            ).value,
        }
    }
}
