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
    public liveUpdate?: (value: number) => void
    public decimals?: number

    constructor(
        public value: number,
        public label: string,
        change?: () => void,
        public increment?: number,
        readonly?: boolean,
        liveUpdate?: (value: number) => void,
        decimals?: number
    ) {
        super('number', { initial: value, readonly: Boolean(readonly), change })
        this.liveUpdate = liveUpdate
        this.decimals = decimals
    }
}
export function CustomLabeledInputControl(props: {
    data: LabeledInputControl
    styles?: () => any
}) {
    const [value, setValue] = React.useState(props.data.value)
    const ref = React.useRef<HTMLInputElement>(null)
    const isDragging = React.useRef(false)
    const startX = React.useRef(0)
    const startY = React.useRef(0)
    const startValue = React.useRef(0)
    Drag.useNoDrag(ref)

    React.useEffect(() => {
        setValue(props.data.value)
    }, [props.data.value])

    const handleMouseDown = React.useCallback(
        (e: React.MouseEvent) => {
            if (props.data.readonly) return
            isDragging.current = true
            startX.current = e.clientX
            startY.current = e.clientY
            startValue.current = value
            document.body.style.cursor = 'move'
            e.preventDefault()
        },
        [value, props.data.readonly]
    )

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return

            const deltaY = startY.current - e.clientY
            const deltaX = e.clientX - startX.current
            const increment = props.data.increment || 1

            // Horizontal position controls sensitivity
            // Left (negative deltaX) = larger increments, Right (positive deltaX) = smaller increments
            // Use exponential scale: every 50px right divides sensitivity by 2, every 50px left multiplies by 2
            const sensitivityMultiplier = Math.pow(2, -deltaX / 50)
            const baseSensitivity = 0.5
            let newValue =
                startValue.current + deltaY * baseSensitivity * increment * sensitivityMultiplier

            // Round to specified decimal places if set
            if (props.data.decimals !== undefined) {
                const factor = Math.pow(10, props.data.decimals)
                newValue = Math.round(newValue * factor) / factor
            }

            setValue(newValue)
            props.data.value = newValue

            // Use liveUpdate for smooth parameter ramping during drag (no graph rebuild)
            if (props.data.liveUpdate) {
                props.data.liveUpdate(newValue)
            }
        }

        const handleMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false
                document.body.style.cursor = ''
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [props.data])

    return (
        <div>
            <div style={{ padding: '5px 6px' }}>{props.data.label}</div>
            <Input
                value={value}
                type={props.data.type}
                ref={ref}
                readOnly={props.data.readonly}
                onMouseDown={handleMouseDown}
                onChange={(e) => {
                    const val = (
                        props.data.type === 'number'
                            ? +e.target.value
                            : e.target.value
                    ) as (typeof props.data)['value']

                    setValue(val)
                    props.data.setValue(val)
                }}
                step={props.data.increment}
                styles={props.styles}
                style={{ cursor: props.data.readonly ? 'default' : 'move' }}
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
