import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx, audioSources, audioSourceStates } from '../default'
import { DropdownControl } from '../controls/DropdownControl'

export class EditorNoiseNode extends Classic.Node<
    {},
    { signal: Classic.Socket },
    { noiseType: DropdownControl }
> {
    width = 180
    height = 130
    constructor(change: () => void, initial?: { noiseType: string }) {
        super('Noise')
        const dropdownOptions = [
            { value: 'White Noise', label: 'White Noise' },
            { value: 'Brown Noise', label: 'Brown Noise' },
            { value: 'Pink Noise', label: 'Pink Noise' },
            { value: 'Blue Noise', label: 'Blue Noise'},
            { value: 'Violet Noise', label: 'Violet Noise'},
            { value: 'Grey Noise', label: 'Grey Noise'},
            { value: 'Velvet Noise', label: 'Velvet Noise'},
        ]
        this.addControl(
            'noiseType',
            new DropdownControl(
                change,
                dropdownOptions,
                initial ? initial.noiseType : 'White Noise'
            )
        )
        this.addOutput('signal', new Classic.Output(socket, 'Signal'))
    }

    data(): { signal: AudioNode } {
        const noiseSource = audioCtx.createBufferSource()
        var bufferSize = 10 * audioCtx.sampleRate
        var noiseBuffer = audioCtx.createBuffer(
            1,
            bufferSize,
            audioCtx.sampleRate
        )
        var output = noiseBuffer.getChannelData(0)

        if (this.controls.noiseType.value === 'White Noise') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1
            }
        } else if (this.controls.noiseType.value === 'Brown Noise') {
            var lastOut = 0
            for (let i = 0; i < bufferSize; i++) {
                var brown = Math.random() * 2 - 1

                output[i] = (lastOut + 0.02 * brown) / 1.02
                lastOut = output[i]
                output[i] *= 3.5
            }
        } else if (this.controls.noiseType.value === 'Pink Noise') {
            let b0, b1, b2, b3, b4, b5, b6;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                let white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }
        } else if (this.controls.noiseType.value === 'Blue Noise') { 
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            let alpha = 0.1;
            let previousValue = 0;
            for (let i = 1; i < bufferSize; i++) {
                output[i] = alpha * (output[i] - previousValue) + output[i-1];
                previousValue = output[i];
            }
        } else if (this.controls.noiseType.value === 'Violet Noise') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            for (let i = bufferSize - 1; i > 0; i--) {
                output[i] = output[i] - output[i - 1];
            }
        } else if (this.controls.noiseType.value === 'Grey Noise') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            let previousValue = 0;
            const smoothingFactor = 0.02;
            for (let i = 0; i < bufferSize; i++) {
                output[i] = smoothingFactor * output[i] + (1 - smoothingFactor) * previousValue;
                previousValue = output[i];
            }
        } else if (this.controls.noiseType.value === 'Velvet Noise') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = 0;
            }
            const impulseDensity = 100;
            const numberOfImpulses = Math.floor(bufferSize / impulseDensity);
            for (let i = 0; i < numberOfImpulses; i++) {
                const position = Math.floor(Math.random() * bufferSize);
                output[position] = Math.random() * 2 - 1;
            }
        }
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true

        audioSources.push(noiseSource)
        audioSourceStates.push(false)

        return {
            signal: noiseSource,
        }
    }

    serialize() {
        return {
            noiseType: this.controls.noiseType.value as string,
        }
    }
}
