import { ClassicPreset as Classic } from "rete"
import { socket, audioCtx } from "../default"
import { LabeledInputControl } from "../controls/LabeledInputControl"

export class EditorDelayNode extends Classic.Node<{ signal: Classic.Socket, delayTime: Classic.Socket }, { signal: Classic.Socket }, { maxDelay: LabeledInputControl }> {
	width = 180
	height = 240
	constructor(change: () => void, initial?: { delay: number, maxDelay: number }) {
		super('Delay');


		let signalInput = new Classic.Input(socket, 'Signal', true);
		this.addInput("signal", signalInput);

		let delayInput = new Classic.Input(socket, "Delay Time", false);
		delayInput.addControl(new LabeledInputControl(initial ? initial.delay : 1, "Delay Time", change))
		this.addInput("delayTime", delayInput);

		this.addControl("maxDelay", new LabeledInputControl(initial ? initial.maxDelay : 1, "Max Delay", change))

		this.addOutput("signal", new Classic.Output(socket, "Signal"))
	}

	data(inputs: { signal?: AudioNode[], delayTime?: AudioNode[] }): { signal: AudioNode } {
		const delayControl = this.inputs.delayTime?.control;

		const delayNode = audioCtx.createDelay(Math.max(this.controls.maxDelay.value, 1));

		if (inputs.delayTime && inputs.delayTime.length > 0) {
			delayNode.delayTime.setValueAtTime(0, audioCtx.currentTime)
			inputs.delayTime.forEach(itm => itm.connect(delayNode.delayTime))
		} else {
			delayNode.delayTime.setValueAtTime((delayControl as LabeledInputControl).value || 0, audioCtx.currentTime);
		}

		inputs.signal?.forEach(itm => itm.connect(delayNode))

		return {
			signal: delayNode
		}
	}

	serialize() {
		return {
			delay: (this.inputs.delayTime?.control as LabeledInputControl).value,
			maxDelay: this.controls.maxDelay.value
		}
	}
}