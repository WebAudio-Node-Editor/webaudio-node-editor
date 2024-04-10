import { ClassicPreset as Classic } from 'rete'
import { useRef } from 'react'

export class PlaybackControl extends Classic.Control {
    constructor(
        public onPlay: () => void,
        public onPause: () => void,
        public onRestart: () => void,
        public onLoopChange: (loop: boolean) => void,
        public loop: boolean
    ) {
        super()
    }

    handlePlay = () => {
        this.onPlay()
    }

    handlePause = () => {
        this.onPause()
    }

    handleRestart = () => {
        this.onRestart()
    }

    handleLoopChange = () => {
        const newLoopValue = !this.loop
        this.onLoopChange(newLoopValue)
    }
}

export function CustomPlaybackControl(props: { data: PlaybackControl }) {
    const { data: control } = props

    const handlePlayClick = () => {
        control.handlePlay()
    }

    const handlePauseClick = () => {
        control.handlePause()
    }

    const handleRestartClick = () => {
        control.handleRestart()
    }

    const handleLoopChange = () => {
        control.handleLoopChange()
    }

    return (
        <div>
            <button onClick={handlePlayClick}>Play</button><br></br>
            <button onClick={handlePauseClick}>Pause</button><br></br>
            <button onClick={handleRestartClick}>Restart</button><br></br>
            <input
                type="checkbox"
                checked={control.loop}
                onChange={handleLoopChange}
            />
            <label>Loop</label>
        </div>
    )
}
