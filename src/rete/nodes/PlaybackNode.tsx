import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx, audioSources, audioSourceStates } from '../default'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'

//const audioCtx = new AudioContext();
//potential can arise if broswers only support older version -> tbd
//const audioSources: { [key: string]: AudioBufferSourceNode } = {};
//const audioSourceStates: { [key: string]: AudioSourceState } = {};

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
    audioBuffer: AudioBuffer | null = null;
    constructor(change: () => void) {
        super('Playback')
        this.addOutput('playback', new Classic.Output(socket, 'Playback'))
        //const { change } = props; 
        this.addControl(
            'file',
            new FileUploadControl(change)
        )
        this.addControl(
            'play',
            new PlaybackControl(this.handlePlay, this.handlePause, this.handleRestart, this.handleLoopChange, false)
        )
        this.addControl(
            'pause',
            new PlaybackControl(this.handlePlay, this.handlePause, this.handleRestart, this.handleLoopChange, false)
        )
        this.addControl(
            'restart',
            new PlaybackControl(this.handlePlay, this.handlePause, this.handleRestart, this.handleLoopChange, false)
        )
        this.addControl(
            'loop',
            new PlaybackControl(this.handlePlay, this.handlePause, this.handleRestart, this.handleLoopChange, true)
        )
        this.addOutput(
            'playback', 
            new Classic.Output(socket, 'Playback')
        )
    }
    

    handleFileUpload = async (file: File) => {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const arrayBuffer = fileReader.result;
              const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
              
            };
            fileReader.readAsArrayBuffer(file);
     };

    handlePlay = () => {
        const { playback } = this.getData('playback');
        playback.connect(audioCtx.destination);
        playback.onended = () => {
            playback.disconnect();
        };
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

    handleLoopChange = () => {
        const newLoopValue = !this.loop;
        const { playback } = this.getData('playback');
        playback.loop = newLoopValue;
        this.onLoopChange(newLoopValue);
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