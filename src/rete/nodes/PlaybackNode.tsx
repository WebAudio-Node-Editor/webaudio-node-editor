import { ClassicPreset as Classic } from 'rete'
import {
    socket,
    audioCtx,
    audioSources,
    audioSourceStates,
    globalGain,
} from '../default'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'
import { CustomPlaybackControl } from '../controls/PlaybackControl'

//const audioCtx = new AudioContext();
//potential can arise if broswers only support older version -> tbd
//const audioSources: { [key: string]: AudioBufferSourceNode } = {};
//const audioSourceStates: { [key: string]: AudioSourceState } = {};

/*interface AudioSourceState {
    isPlaying: boolean
    isPaused: boolean
    isLooping: boolean
}*/

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
    height = 220
    audioBuffer: AudioBuffer | null = null
    loop: boolean = false
    private audioSource: AudioBufferSourceNode | null = null
    //selectedFile: File | null = null

    constructor(change: () => void) {
        super('Playback')
        this.addControl('file', new FileUploadControl(this.handleFileUpload))
        this.addControl(
            'play',
            new PlaybackControl(
                this.handlePlay,
                this.handlePause,
                this.handleRestart,
                this.handleLoopChange
            )
        )
        this.addOutput('playback', new Classic.Output(socket, 'Signal'))
    }

    handleFileUpload = async (file: File) => {
        const fileReader = new FileReader()
        fileReader.onload = async () => {
            const arrayBuffer = fileReader.result
            if (arrayBuffer !== null) {
                this.audioBuffer = await audioCtx.decodeAudioData(
                    arrayBuffer as ArrayBuffer
                )
                //this.selectedFile = file;
            } else {
                console.error('Error decoding audio file')
            }
        }
        fileReader.readAsArrayBuffer(file)
    }

    handlePlay = () => {
        if(!this.audioBuffer) {
            return
        }
        if(!this.audioSource){
            
            if (!this.outputs.playback) {
                console.warn('Playback node does not have a "playback" output');
                return;
            }
            
    
            //const outputConnections = this.outputs.playback.connections;
            /*
            if (outputConnections.length === 0) {
                console.warn('Playback node is not connected to an output node');
                return;
            }*/

            this.audioSource = audioCtx.createBufferSource()
            this.audioSource.buffer = this.audioBuffer
            this.audioSource.loop = this.controls.play.loop 

            //this.audioSource.connect(this.outputs.playback);
            this.audioSource.connect(globalGain)

            this.audioSource.start()
            this.controls.play.playing = true
        }
        else{
            audioCtx.resume()
            this.controls.play.playing = true
        }
    }

    handlePause = () => {
        if (this.audioSource) {
            audioCtx.suspend()
            this.controls.play.playing = false
            //this.audioSource.disconnect()
            //this.audioSource = null
        }
    }

    handleRestart = () => {
        if(this.audioSource){
            //audioCtx.suspend()
            this.audioSource.stop()
            this.audioSource.disconnect()
            this.audioSource = null 
        }
        this.controls.play.playing = false
       // this.handlePause()
        this.handlePlay()
    }

    handleLoopChange = (loop: boolean) => {
        this.controls.play.loop = loop
        /*
        if (!this.audioBuffer){
            return 
        }*/
        if (this.audioSource) {
            this.audioSource.loop = loop
        }
        /*
        else if(this.audioSource.loop = loop){

        }
        */
    }

   // data(): { playback: AudioNode } {
       /* const outputNode = this.outputs.get('playback')?.connections[0]?.node;

        if (outputNode instanceof UniversalOutputNode) {
          return {
            playback: this.audioSource || audioCtx.createBufferSource(),
          };
        } else {
          console.error('PlaybackNode must be connected to a UniversalOutputNode');
          return {};
            }
      }

      if (this.outputs.signal.connections.length === 0) {
        console.warn('Noise node is not connected');
        return { signal: null }; 
      }

        return {
            signal: noiseSource,
        }
    }

    if (!this.audioSource) {
        return { signal: audioCtx.createBufferSource() };
    }

    return {
        signal: this.audioSource,
  
    //return {
      //      signal: this.audioSource || audioCtx.createBufferSource(),
        //}

    };*/

    data(): { playback: AudioBufferSourceNode } {
        return {
            playback: this.audioSource || audioCtx.createBufferSource(),
        }
    }


    serialize() {
        return {
            loop: this.loop,
          
        }
    }
}
