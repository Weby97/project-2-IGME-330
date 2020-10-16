/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, rectArray;


function setupCanvas(canvasElement, analyserNodeRef) {
	rectArray = [];
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx, 0, 0, 0, canvasHeight, [{ percent: 0, color: "#ffcdb2" }, { percent: .25, color: "#ffb4a2" }, { percent: .5, color: "#e5989b" }, { percent: .75, color: "#b5838d" }, { percent: 1, color: "#6d6875" }]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize / 2);
}

function draw(params = {}) {
	// 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data

	// 2 - draw background
	ctx.save();
	ctx.fillStyle = "black";
	ctx.globalAlpha = .1;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.restore();

	// 3 - draw gradient
	if (params.showGradient) {
		ctx.save();
		ctx.fillStyle = gradient;
		ctx.globalAlpha = .3;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.restore();
    }
	// 4 - draw bars
	if (params.showBars) {
		let barSpacing = 4;
		let margin = 5;
		let screenWidthForBars = canvasWidth - (audioData.length * barSpacing) - margin * 2;
		let barWidth = screenWidthForBars / audioData.length;
		let barHeight = 200;
		let topSpacing = 100;

		ctx.save();
		ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.50)';

		// loop through the data and draw!
		for (let i = 0; i < audioData.length; i++) {
			ctx.fillRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
			ctx.strokeRect(margin + i * (barWidth + barSpacing), topSpacing + 256 - audioData[i], barWidth, barHeight);
		}

		ctx.restore();
	}

	// 4.5 - draw squares
	if (params.showSquares) {
		if ((audioData[audioData.length - 1]) == 20) {
			if (rectArray.length < 100) {
				let aRect = { x: canvasWidth, y: canvasHeight / 2, width: 20, height: 50 };
				rectArray.push(aRect);
			}
		}
    }

	// 5 - draw circles
	if (params.showCircles) {
		let maxRadius = canvasHeight / 4;
		ctx.save();
		ctx.globalAlpha = 0.5;
		for (let i = 0; i < audioData.length; i++) {
			// even lighter blue circles
			let percent = audioData[i] / 255;

			let circleRadius = percent * maxRadius;
			ctx.beginPath();
			ctx.fillStyle = utils.makeColor(72, 202, 228, .34 - percent / 3.0);
			ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			// lighter blue, bigger, more transparent
			ctx.beginPath();
			ctx.fillStyle = utils.makeColor(0, 180, 216, .10 - percent / 10.0);
			ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * 1.5, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();

			// dark blue circles, smaller
			ctx.save();
			ctx.beginPath();
			ctx.fillStyle = utils.makeColor(0, 150, 199, .5 - percent / 5.0);
			ctx.arc(canvasWidth / 2, canvasHeight / 2, circleRadius * .50, 0, 2 * Math.PI, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
		}
		ctx.restore();
	}

	// 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
	// the variable `data` below is a reference to that array 
	let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	let data = imageData.data;
	let length = data.length;
	let width = imageData.width; // not using here

	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
	for (let i = 0; i < length; i += 4) {
	// C) randomly change every 20th pixel to red
		if (params.showNoise && Math.random() < .05) {
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i + 1] = data[i + 2] = 0; // zero out the red and green and blue channels
			data[i] = 105; // Recolor the RGB Channels to what you want
			data[i + 1] = 181;
			data[i + 2] = 120;
		} // end if

		// 7 - Invert Colors
		if (params.showInvert) {
			let red = data[i], green = data[i + 1], blue = data[i + 2];
			data[i] = 255 - red;	   // set red value
			data[i + 1] = 255 - green; // set green value
			data[i + 2] = 255 - blue;  // set blue value
			// data[i+3] is the alpha but we're leaving that alone
		}
	} // end for

	// 8 - Emboss
	if (params.showEmboss) {
		// note we are stepping through *each* sub-pixel
		for (let i = 0; i < length; i++) {
			if (i % 4 == 3) continue; // skip alpha channel
			data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
		}
	}

	// D) copy image data back to canvas
	ctx.putImageData(imageData, 0, 0);

	for (let rect of rectArray) {
		rect.x -= 3;
		utils.drawRectangle(ctx, rect.x, rect.y, rect.width, rect.height);
		if (rect.x <= 0) {
			rectArray.shift();
        }
    }
}

export { setupCanvas, draw };