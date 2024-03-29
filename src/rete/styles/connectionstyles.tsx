import * as React from 'react'
import styled from 'styled-components'
import { ClassicScheme, Presets } from 'rete-react-plugin'

const { useConnection } = Presets.classic

const Svg = styled.svg`
    overflow: visible !important;
    position: absolute;
    pointer-events: none;
    width: 9999px;
    height: 9999px;
`

const DashedPath = styled.path<{ styles?: (props: any) => any }>`
    fill: none;
    stroke-width: 6px;
    stroke: rgba(255, 255, 255, 1);
    stroke-dasharray: 6 4;
    pointer-events: auto;
    ${(props) => props.styles && props.styles(props)}
`

const SolidPath = styled.path<{ styles?: (props: any) => any }>`
    fill: none;
    stroke-width: 6px;
    stroke: rgba(255, 255, 255, 1);
    pointer-events: auto;
    ${(props) => props.styles && props.styles(props)}
`

export function DashedConnection(props: {
    data: ClassicScheme['Connection'] & { isLoop?: boolean }
    styles?: () => any
}) {
    const { path } = useConnection()

    if (!path) return null

    return (
        <Svg data-testid="connection">
            <DashedPath styles={props.styles} d={path} />
        </Svg>
    )
}

export function SolidConnection(props: {
    data: ClassicScheme['Connection'] & { isLoop?: boolean }
    styles?: () => any
}) {
    const { path } = useConnection()

    if (!path) return null

    return (
        <Svg data-testid="connection">
            <SolidPath styles={props.styles} d={path} />
        </Svg>
    )
}
