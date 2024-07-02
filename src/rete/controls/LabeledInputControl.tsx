import { ClassicPreset as Classic } from 'rete'
import { Drag } from 'rete-react-plugin'
import * as React from 'react'
import styled from 'styled-components'

const Input = styled.input<{ styles?: (props: any) => any }>`
    width: 100%;
    border-radius: 30px;
    background-color: white;
    padding: 2px 6px;
    border: 1px solid #999;
    font-size: 110%;
    box-sizing: border-box;
    ${(props) => props.styles && props.styles(props)}
`

export class LabeledInputControl extends Classic.InputControl<'number'> {
    constructor(
        public value: number,
        public label: string,
        change?: () => void,
        public increment?: number,
        readonly?: boolean
    ) {
        super('number', { initial: value, readonly: Boolean(readonly), change })
    }
}
export function CustomLabeledInputControl(props: {
    data: LabeledInputControl
    styles?: () => any
}) {
    const [value, setValue] = React.useState(props.data.value)
    const ref = React.useRef(null)
    Drag.useNoDrag(ref)

    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = (
            props.data.type === 'number'
                ? (String(e.target.value) === '' ? '' : +e.target.value)
                : e.target.value
        ) as (typeof props.data)['value']

        // If input is empty, keep field empty, but set value internally as zero
        setValue(val)
        // props.data.setValue(String(val) === '' ? 0 : val); // this line SHOULD give us required behavior, but doesn't
        props.data.setValue(val); // this line unexpectedly gives us required behavior
    }

    const handleBlur = () => {
        // If input field is out of focus and empty, set value to 0
        if (String(value) === '') {
            setValue(0);
            props.data.setValue(0);
        }
    };

    return (
        <div>
            <div style={{ padding: '5px 6px' }}>{props.data.label}</div>
            <Input
                value={value}
                type={props.data.type}
                ref={ref}
                readOnly={props.data.readonly}
                onChange={handleChange}
                onBlur={handleBlur}
                step={props.data.increment}
                styles={props.styles}
            />
        </div>
    )
}

/*
export class LabeledInputControl extends Classic.InputControl<'number'> {
    constructor(
        public value: number,
        public label: string,
        change?: () => void,
        readonly?: boolean
    ) {
        super('number', { initial: value, readonly: Boolean(readonly), change })
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
*/
