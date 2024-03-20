# WebAudio Node Editor

## What is this?

This is a node-based editor for WebAudio created using Rete.js, a Javascript framework for visual programming through node editors. Node editors are widely used in shader editors and even game programming (as in Unreal Engine's Blueprints). Having used node editors for Blender and other software, I wanted to take a stab at making my own node editor for WebAudio, since I found that I really missed having something like this while working on the homework for this class. Now, we've taken up this project as a group to continue development.
Note: this has only been fully tested in Google Chrome. I know some things don't work in Firefox, and I'm not sure about other browsers.

## Implementation

The nice thing about this project is that WebAudio already naturally lends itself to a node-based approach. Since the underlying structure of WebAudio is already based on nodes and connections, all that needs to really be done is to link up the data connections of Rete's nodes with WebAudio nodes.
The basic structure of a Rete node contains a series of inputs, outputs, and controls. Inputs and outputs are fairly self-explanatory, and controls are the modifiable fields that let us control the node's parameters without explicitly attaching an input (such as the waveform field on an oscillator node). The frequency and time domain visualizers are implemented as custom versions of controls as well - Rete is highly customizable, and I had to write many custom components for this project. Generally speaking, most numerical parameters of AudioNodes are implemented as inputs, and nonnumerical inputs (e.g. waveform, filter type) as controls. This ensures that the data flow through connections is strictly limited to numerical data (which is actually AudioNodes under the hood, even for constants).
Finally, all nodes being used with Rete's Dataflow Engine (one way to process data in Rete) require a data() method. This is what transforms the inputs of a node into the output signal. Generally, most of my nodes simply create their corresponding AudioNode and connect() their inputs accordingly, and return the new node as the signal to be sent to the next node.

## Limitations and Future Steps

-   Some clipping prevention is included through a DynamicsCompressorNode, but it's not always enough
-   We haven't figured out how to get AudioWorkletNodes to play nice with React yet, but we hope we can get this soon
-   Cycles are not allowed by Rete
-   Errors can force you to have to refresh before the app works again
-   There's noticeable clicking artifacts when reevaluating the node graph

## Visit the webapp and try it [here](https://webaudio-node-editor.github.io/webaudio-node-editor/#/)!

[Video Demo](https://youtu.be/TkXoJeamk2c)

## Check out the [Wiki](https://github.com/WebAudio-Node-Editor/webaudio-node-editor/wiki) to get started!
