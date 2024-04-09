import { ClassicPreset as Classic } from 'rete'
import { socket, audioCtx, audioSources, audioSourceStates } from '../default'
import { PlaybackControl } from '../controls/PlaybackControl'
import { FileUploadControl } from '../controls/FileUploadControl'
import { CustomPlaybackControl } from '../controls/PlaybackControl';

//const audioCtx = new AudioContext();
//potential can arise if broswers only support older version -> tbd
//const audioSources: { [key: string]: AudioBufferSourceNode } = {};
//const audioSourceStates: { [key: string]: AudioSourceState } = {};

interface AudioSourceState {
    isPlaying: boolean;
    isPaused: boolean;
    isLooping: boolean;
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
  { file: FileUploadControl; play: PlaybackControl; pause: PlaybackControl; restart: PlaybackControl; loop: PlaybackControl }
> {
    width = 180
    height = 210
    audioBuffer: AudioBuffer | null = null;
    loop: boolean = false;
    private audioSource: AudioBufferSourceNode | null = null;
    selectedFile: File | null = null;
 
    constructor(change: () => void) {
        super('Playback')
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
            new Classic.Output(socket, 'Signal')
        )
    }
    

    handleFileUpload = async (file: File) => {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const arrayBuffer = fileReader.result;
              if (arrayBuffer !==null) {
                    this.audioBuffer = await audioCtx.decodeAudioData(arrayBuffer as ArrayBuffer); 
              }
              else{
                console.error('Error decoding audio file');
              }
             
            };
            fileReader.readAsArrayBuffer(file);
            this.selectedFile = file;
     };

    handlePlay = () => {
        const { playback } = this.data();
        playback.connect(audioCtx.destination);
        playback.onended = () => {
            playback.disconnect();
        };
        playback.start();
      };
      
    handlePause = () => {
        const { playback } = this.data();
        playback.stop();
      };
      
    handleRestart = () => {
        const { playback } = this.data();
        playback.stop();
        playback.start(0);
      };

    handleLoopChange = (loop: boolean) => {
        this.loop = loop;
        const { playback } = this.data();
        playback.loop = loop;
      };

    
      data(): { playback: AudioBufferSourceNode } {
        if (!this.audioSource) {
            this.audioSource = audioCtx.createBufferSource();
            this.audioSource.buffer = this.audioBuffer;
            this.audioSource.loop = this.controls.loop.loop;
        }

        return {
            playback: this.audioSource
        };
    }

    serialize() {
        return {
          loop: this.loop,
          selectedFile: this.selectedFile
        };
      }
    }
