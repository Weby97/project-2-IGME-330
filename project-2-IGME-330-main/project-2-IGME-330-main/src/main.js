/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!
import * as canvas from './canvas.js';
import * as audio from './audio.js';
import * as utils from './utils.js';
import * as classes from './classes.js';

const drawParams = {
	showGradient: false,
	showCircles:  false,
	showNoise: false,
	showInvert: false,
	showSquares: true,
	showEmboss: false,
	highshelf: false,
	lowshelf: false,
    doHandGame:true
};

// gainValue is how much of the LOWSHELF we want in. Base is 15.
let gainValue = 15;

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1: "media/New Adventure Theme.mp3"
});

function init() {
	//console.log("init called");
	//console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	audio.setupWebaudio(DEFAULTS.sound1);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	setupUI(canvasElement);
	canvas.setupCanvas(canvasElement, audio.analyserNode);
	loop();
}

function setupUI(canvasElement) {
	// A - hookup fullscreen button
	const fsButton = document.querySelector("#fsButton");

	// add .onclick event to button
	fsButton.onclick = e => {
		console.log("init called");
		utils.goFullscreen(canvasElement);
	};

	// B - hookup play button
	// add .onclick event to button
	playButton.onclick = e => {
		//console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

		// check if context is in suspended state (autoplay policy)
		if (audio.audioCtx.state == "suspended") {
			audio.audioCtx.resume();
		}



		//console.log(`audioCtx.state after = ${audio.audioCtx.state}`);


		if (e.target.dataset.playing == "no") {
			// if track is currently paused, play it
			audio.playCurrentSound();
			e.target.dataset.playing = "yes"; // our CSS will set the text to "Pause"
			// if track IS playing, pause it
		} else {
			audio.pauseCurrentSound();
			e.target.dataset.playing = "no"; // our CSS will set the text to "Play"
		}
	};

	// C - hookup volume slider & label
	let volumeSlider = document.querySelector("#volumeSlider");
	let volumeLabel = document.querySelector("#volumeLabel");

	// add .oninput event to slider
	volumeSlider.oninput = e => {
		// set the gain
		audio.setVolume(e.target.value);
		// update value of label to match value of slider
		volumeLabel.innerHTML = Math.round((e.target.value / 2 * 100));
	};

	// set value of label to match initial value of slider
	volumeSlider.dispatchEvent(new Event("input"));

	// D - hookup track <select>
	let trackSelect = document.querySelector("#trackSelect");
	// add .onchange event to <select>
	trackSelect.onchange = e => {
		audio.loadSoundFile(e.target.value);
		// pause the current track if it is playing
		if (playButton.dataset.playing = "yes") {
			playButton.dispatchEvent(new MouseEvent("click"));
		}
	};

	// Event handlers for checkboxes

	// ----- GRADIENT -----
	// I. set the initial state of the gradient checkbox
	document.querySelector('#gradientCB').checked = drawParams.showGradient;

	// II. change the value of `drawParams.showGradient` every time the gradient checkbox changes state
	document.querySelector('#gradientCB').onchange = e => {
		drawParams.showGradient = e.target.checked;
	};

	// ----- BARS -----
	// I. set the initial state of the bars checkbox
	document.querySelector('#barsCB').checked = drawParams.showBars;

	// II. change the value of `drawParams.showBars` every time the bars checkbox changes state
	document.querySelector('#barsCB').onchange = e => {
		drawParams.showBars = e.target.checked;
	};

	// ----- Squares -----
	// I. set the initial state of the squares checkbox
	document.querySelector('#squaresCB').checked = drawParams.showSquares;

	// II. change the value of `drawParams.showSquares` every time the bars checkbox changes state
	document.querySelector('#squaresCB').onchange = e => {
		drawParams.showSquares = e.target.checked;
	};

	// ----- CIRCLES -----
	// I. set the initial state of the circles checkbox
	document.querySelector('#circlesCB').checked = drawParams.showCircles;

	// II. change the value of `drawParams.showCircles` every time the circles checkbox changes state
	document.querySelector('#circlesCB').onchange = e => {
		drawParams.showCircles = e.target.checked;
	};

	// ----- NOISE -----
	// I. set the initial state of the noise checkbox
	document.querySelector('#noiseCB').checked = drawParams.showNoise;

	// II. change the value of `drawParams.showNoise` every time the noise checkbox changes state
	document.querySelector('#noiseCB').onchange = e => {
		drawParams.showNoise = e.target.checked;
	};

	// ----- INVERT -----
	// I. set the initial state of the invert checkbox
	document.querySelector('#invertCB').checked = drawParams.showInvert;

	// II. change the value of `drawParams.showInvert` every time the invert checkbox changes state
	document.querySelector('#invertCB').onchange = e => {
		drawParams.showInvert = e.target.checked;
	};

	// ----- EMBOSS -----
	// I. set the initial state of the emboss checkbox
	document.querySelector('#embossCB').checked = drawParams.showEmboss;

	// II. change the value of `drawParams.showEmboss` every time the emboss checkbox changes state
	document.querySelector('#embossCB').onchange = e => {
		drawParams.showEmboss = e.target.checked;
	};


	// I. set the initial state of the high shelf checkbox
	document.querySelector('#highshelfCB').checked = drawParams.highshelf; // `highshelf` is a boolean we will declare in a second

	// II. change the value of `highshelf` every time the high shelf checkbox changes state
	document.querySelector('#highshelfCB').onchange = e => {
		drawParams.highshelf = e.target.checked;
		toggleHighshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
	};

	// I. set the initial state of the low shelf checkbox
	document.querySelector('#lowshelfCB').checked = drawParams.lowshelf; // `lowshelf` is a boolean we will declare in a second
	

	// II. change the value of `lowshelf` every time the high shelf checkbox changes state
	document.querySelector('#lowshelfCB').onchange = e => {
		drawParams.lowshelf = e.target.checked;
		toggleLowshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
	};

	let lowSlider = document.querySelector('#lowshelfSlider');
	lowSlider.onchange = e => {
		gainValue = Math.floor(lowSlider.value);
		document.querySelector('#lowshelfVal').innerHTML = lowSlider.value;
		toggleLowshelf(); // turn on or turn off the filter, depending on the value of `highshelf`!
	};

	// III. 
	document.querySelector('#lowshelfVal').innerHTML = lowSlider.value;
	toggleHighshelf(); // when the app starts up, turn on or turn off the filter, depending on the value of `highshelf`!
	toggleLowshelf();



} // end setupUI

function loop() {
	/* NOTE: This is temporary testing code that we will delete in Part II */
	requestAnimationFrame(loop);
	canvas.draw(drawParams);
}

function toggleHighshelf() {
	if (drawParams.highshelf) {
		audio.biquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
		audio.biquadFilter.gain.setValueAtTime(25, audio.audioCtx.currentTime);
	} else {
		audio.biquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime);
	}
}

function toggleLowshelf() {
	if (drawParams.lowshelf) {
		audio.lowShelfBiquadFilter.frequency.setValueAtTime(1000, audio.audioCtx.currentTime);
		audio.lowShelfBiquadFilter.gain.setValueAtTime(gainValue, audio.audioCtx.currentTime);
	} else {
		audio.lowShelfBiquadFilter.gain.setValueAtTime(0, audio.audioCtx.currentTime);
	}
}

export { init };