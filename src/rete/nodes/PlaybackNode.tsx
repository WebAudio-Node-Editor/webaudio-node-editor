import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx, audioSources, audioSourceStates, globalGain } from '../default'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'
import { CustomPlaybackControl } from '../controls/PlaybackControl'

//const audioCtx = new AudioContext();
//potential can arise if broswers only support older version -> tbd
//const audioSources: { [key: string]: AudioBufferSourceNode } = {};
//const audioSourceStates: { [key: string]: AudioSourceState } = {};

interface AudioSourceState {
    isPlaying: boolean
    isPaused: boolean
    isLooping: boolean
}

//const audioSourceStates: AudioSourceState[] = [];

/* Adding a new AudioSourceState object to the array
export const newAudioSourceState: AudioSourceState = {
    isPlaying: false,
    isPaused: false,
    isLooping: true,
  };
  
  audioSourceStates.push(newAudioSourceState);
  */
export class PlaybackNode extends Classic.Node<
    {},
    { playback: Classic.Socket },
    {
        file: FileUploadControl
        play: PlaybackControl
        pause: PlaybackControl
        restart: PlaybackControl
        loop: PlaybackControl
    }
> {
    width = 180
    height = 210
    audioBuffer: AudioBuffer | null = null
    loop: boolean = false
    private audioSource: AudioBufferSourceNode | null = null
    selectedFile: File | null = null

    constructor(change: () => void) {
        super('Playback')
        this.addControl('file', new FileUploadControl(change))
        this.addControl(
            'play',
            new PlaybackControl(
                this.handlePlay,
                this.handlePause,
                this.handleRestart,
                this.handleLoopChange,
                false
            )
        )
        this.addOutput('playback', new Classic.Output(socket, 'Signal'))
    }

    handleFileUpload = async (file: File) => {
        const fileReader = new FileReader()
        fileReader.onload = async () => {
            const arrayBuffer = fileReader.result
            if (arrayBuffer !== null) {
                this.audioBuffer = await audioCtx.decodeAudioData(arrayBuffer as ArrayBuffer)
                this.selectedFile = file;
            } else {
                console.error('Error decoding audio file')
            }
        }
        fileReader.readAsArrayBuffer(file)
    }

    handlePlay = () => {
        if (!this.audioSource && this.audioBuffer) {
            this.audioSource = audioCtx.createBufferSource()
            this.audioSource.buffer = this.audioBuffer
            this.audioSource.loop = this.loop
            this.audioSource.connect(globalGain)
            this.audioSource.start()
        }
    }

    handlePause = () => {
       if(this.audioSource){
            this.audioSource.stop()
            this.audioSource = null;
       }
    }

    handleRestart = () => {
        this.handlePause();
        this.handlePlay();
    }

    handleLoopChange = (loop: boolean) => {
        this.loop = loop
        if (this.audioSource) {
            this.audioSource.loop = loop 
        }
    }

    data(): { playback: AudioBufferSourceNode } {
        return {
            playback: this.audioSource || audioCtx.createBufferSource(),
        }
    }


    serialize() {
        return {
            loop: this.loop,
            selectedFile: this.selectedFile,
        }
    }
}
