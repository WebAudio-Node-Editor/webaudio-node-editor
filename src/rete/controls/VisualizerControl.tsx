import { ClassicPreset as Classic } from 'rete'
import { useRef } from 'react'

export class VisualizerControl extends Classic.Control {
    constructor(
        public analyserNode: AnalyserNode,
        public isFrequencyDomain: boolean,
        public display_linear: boolean = true
    ) {
        super()
    }
}

export function CustomVisualizerOutput(props: { data: VisualizerControl }) {
    const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>

    function draw() {
        requestAnimationFrame(draw)

        if (canvasRef.current) {
            var canvas = canvasRef.current
            var canvasCtx = canvas.getContext('2d')

            if (canvasCtx) {
                //Time Visualizer
                if (!props.data.isFrequencyDomain) {
                    props.data.analyserNode.fftSize = 2048
                    var bufferLength = props.data.analyserNode.frequencyBinCount
                    var dataArray = new Uint8Array(bufferLength)
                    props.data.analyserNode.getByteTimeDomainData(dataArray)

                    //canvasCtx.fillStyle = "white";
                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
                    canvasCtx.fillStyle = 'rgba(0,0,0,0.3)'
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)

                    canvasCtx.lineWidth = 2
                    canvasCtx.strokeStyle = 'white'

                    canvasCtx.beginPath()

                    var sliceWidth = (canvas.width * 1.0) / bufferLength
                    var x = 0

                    for (var i = 0; i < bufferLength; i++) {
                        var v = dataArray[i] / 128.0
                        var y = (v * canvas.height) / 2

                        if (i === 0) {
                            canvasCtx.moveTo(x, y)
                        } else if (i === bufferLength - 1) {
                            canvasCtx.lineTo(x, y)
                            canvasCtx.lineTo(canvas.width, y)
                        } else {
                            canvasCtx.lineTo(x, y)
                        }
                        x += sliceWidth
                    }

                    canvasCtx.stroke()

                //Frequency Visualizer
                } else {

                    // based on code from https://www.telerik.com/blogs/adding-audio-visualization-react-app-using-web-audio-api
                    const bucketCt =
                        props.data.analyserNode.frequencyBinCount / 8
                    const fftData = new Uint8Array(bucketCt)
                    props.data.analyserNode.maxDecibels = -10
                    props.data.analyserNode.getByteFrequencyData(fftData)
                    const bar_spacing = canvas.width / bucketCt
                    const bar_width = bar_spacing
                    const height_mult = (canvas.height / 255) * 0.9
                    let start_x = 0
                    let start_y = 0

                    canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
                    canvasCtx.fillStyle = 'rgba(0,0,0,0.3)'
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
                    
                    if (props.data.display_linear){
                        for (let i = 0; i < fftData.length; i++) {
                            start_x = i * bar_spacing
                            canvasCtx.fillStyle = 'white'
                            canvasCtx.fillRect(
                                start_x,
                                canvasRef.current.height,
                                bar_width,
                                height_mult * -fftData[i]
                            )
                        }
                    } else {
                        for (let i = 0; i < fftData.length; i++) {
                            // Working solution based on https://stackoverflow.com/questions/42890542/webaudio-audio-visualizer-logarithmic-scale-x-axis
                            const logX = Math.log2(i+1)
                            start_x = logX * (canvas.width / Math.log2(fftData.length))
                            
                            const logY = Math.log2(fftData[i])
                            start_y = logY
                            canvasCtx.fillStyle = 'white'
                            canvasCtx.fillRect(
                                start_x,
                                canvasRef.current.height,
                                bar_width,
                                height_mult * -fftData[i]
                            )
                        }
                    }
                }
            }
        }
    }

    draw()

    return <canvas ref={canvasRef} width={360} height={100}></canvas>
}
