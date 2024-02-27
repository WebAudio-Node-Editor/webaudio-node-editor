import { ClassicPreset as Classic } from 'rete'
import { Presets } from 'rete-react-plugin'
export class LabeledInputControl extends Classic.InputControl<'number'> {
    constructor(
        public value: number,
        public label: string,
        change?: () => void,
        readonly?: boolean
    ) {

        super('number', { initial: value, readonly: Boolean(readonly), change: change })
    }

    setValue(newValue: number): void {
        let incrementor = 1
        if (this.label === 'Base Gain') {
            incrementor = 0.1;
        } 
        if (this.label === 'Base Frequency') {
            incrementor = 50;
        }
        if (newValue > this.value) {
            this.value += incrementor;
        } else {
            this.value -= incrementor;
        }
        this.value = Number(this.value.toFixed(1));
    }
}


export function CustomLabeledInputControl(props: {
    data: LabeledInputControl
}) {
    return (
        <div>
            <div style={{ padding: '5px 6px' }}>{props.data.label}</div>
            {Presets.classic.Control({ data: props.data })}
        </div>
    )
} 