import { Presets } from 'rete-react-plugin'
import { css } from 'styled-components'

const InputStyle = css<{ selected?: boolean }>`
    background: #00000044;
    border: double;
    border-color: white;
`

const OutputStyle = css<{ selected?: boolean }>`
    background: #00000055;
    border: none;
    border-color: white;
`

const SourceStyle = css<{ selected?: boolean }>`
    background: #00000030;
    border: none;
    border-color: #ffffff88;
`

const ProcessorStyle = css<{ selected?: boolean }>`
    background: #00000044;
    border: none;
    border-color: white;
`

export function InputNodeStyle(props: any) {
    // eslint-disable-next-line
    return <Presets.classic.Node styles={() => InputStyle} {...props} />
}
export function OutputNodeStyle(props: any) {
    // eslint-disable-next-line
    return <Presets.classic.Node styles={() => OutputStyle} {...props} />
}
export function SourceNodeStyle(props: any) {
    // eslint-disable-next-line
    return <Presets.classic.Node styles={() => SourceStyle} {...props} />
}
export function ProcessorNodeStyle(props: any) {
    // eslint-disable-next-line
    return <Presets.classic.Node styles={() => ProcessorStyle} {...props} />
}
