import { ClassicPreset as Classic } from 'rete'
import { Presets } from 'rete-react-plugin'
export class LabeledInputControl extends Classic.InputControl<'number'> {
    constructor(
        public value: number,
        public label: string,
        change?: () => void,
        readonly?: boolean
    ) {
        super('number', { initial: value, readonly: Boolean(readonly), change })
    }
    setValue(newValue: number): void {
        let increment = 1
        if (this.label === 'Base Gain'){
            increment = .1
        }
        if (this.label === 'Base Frequency'){
            increment = 10
        }
        
        if (newValue > this.value){
            this.value += increment;
        }
        else {
            this.value -= increment;
        }
        this.value = Number(this.value.toFixed(1))
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
