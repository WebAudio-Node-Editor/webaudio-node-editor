import { ClassicPreset as Classic } from 'rete'
import { useRef } from 'react'

export class PlaybackControl extends Classic.Control {
    playing: boolean = false;
    loop: boolean = false
    constructor(
        public onPlay: () => void,
        public onPause: () => void,
        public onRestart: () => void,
        public onLoopChange: (loop: boolean) => void,
    ) {
        super()
    }

    handlePlay = () => {
        this.playing = true
        this.onPlay()
    }

    handlePause = () => {
        this.playing = false
        this.onPause()
    }

    handleRestart = () => {
        this.playing = true
        this.onRestart()
    }

    handleLoopChange = () => {
        this.loop =!this.loop
        //const newLoopValue = !this.loop
        this.onLoopChange(this.loop)
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
        <button onClick={handlePlayClick} disabled={control.playing}>
          Play
        </button>
        <br />
        <button onClick={handlePauseClick} disabled={!control.playing}>
          Pause
        </button>
        <br />
        <button onClick={handleRestartClick}>Restart</button>
        <br />
        <input
          type="checkbox"
          checked={control.loop}
          onChange={handleLoopChange}
        />
        <label>Loop</label>
      </div>
    )
}
