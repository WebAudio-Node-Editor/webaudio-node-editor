import { ClassicPreset as Classic } from 'rete'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioSources: { [key: string]: AudioBufferSourceNode } = {};
const audioSourceStates: { [key: string]: AudioSourceState } = {};

interface AudioSourceState {
  isPlaying: boolean;
  isPaused: boolean;
  isLooping: boolean;
}

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
        this.addControl(
            'file',
            new FileUploadControl(change)
        )
        this.addControl(
            'play', 
            new PlaybackControl(change, 'Play')
        )
        this.addControl(
            'pause', 
            new PlaybackControl(change, 'Pause')
        )
        this.addControl(
            'restart', 
            new PlaybackControl(change, 'Restart')
        )
        this.addControl(
            'loop', 
            new PlaybackControl(change, 'Loop', false)
            )
        this.addOutput(
            'playback', 
            new Classic.Output(socket, 'Playback')
        )
    }
    

    handleFileUpload = async (file) => {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const arrayBuffer = fileReader.result;
              const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
              
            };
            fileReader.readAsArrayBuffer(file);
     };

    handlePlay = () => {
        const { playback } = this.getData('playback');
        playback.start();
        //next display via playback control 
      };
      
    handlePause = () => {
        const { playback } = this.getData('playback');
        playback.stop();
        //next display via playback control 
      };
      
    handleRestart = () => {
        const { playback } = this.getData('playback');
        playback.stop();
        playback.start(0);
        //next display via playback control 
      };

    
    data(): { playback: AudioBufferSourceNode } {
        let audioSource = audioSources[this.id];
        if (!audioSource) {
            audioSource = audioCtx.createBufferSource();
            audioSources[this.id] = audioSource;
        }

      
        audioSource.buffer = this.audioBuffer;
        audioSource.loop = this.controls.loop.value;

        return { playback: audioSource };
        }
    }

    serialize() {
        return {
            file: this.controls.file.value,
            loop: this.controls.loop.value
        }
    }
}