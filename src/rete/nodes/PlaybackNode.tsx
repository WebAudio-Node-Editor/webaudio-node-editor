import { ClassicPreset as Classic } from 'rete'
import { VisualizerControl } from '../controls/VisualizerControl'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'
import { socket, audioCtx, audioSources, audioSourceStates } from '../default'


export class PlaybackNode extends Classic.Node<
    {},
    { playback: Classic.Socket },
    { file: FileUploadControl, play: PlaybackControl, pause: PlaybackControl, restart: PlaybackControl, loop: PlaybackControl}
> {
    width = 250
    height = 180
    constructor(change: () => void) {
        super('Playback')
        //const { change } = props; 
        this.addControl('file', new FileUploadControl(change))
        this.addControl('play', new PlaybackControl(change, 'Play'))
        this.addControl('pause', new PlaybackControl(change, 'Pause'))
        this.addControl('restart', new PlaybackControl(change, 'Restart'))
        this.addControl('loop', new PlaybackControl(change, 'Loop', false))
        this.addOutput('playback', new Classic.Output(socket, 'Playback'))
    }

    
    data(): { playback: AudioBufferSourceNode } {
        // codeee
        return { playback: null };
    }

    serialize() {
        return {
            file: this.controls.file.value,
            loop: this.controls.loop.value
        }
    }
}