/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as classes from './classes.js';

let ctx, canvasWidth, canvasHeight, gradient, analyserNode, audioData, boxArray, videoElement;

const modelParams = {
    flipHorizontal: false, // flip e.g for video 
    imageScaleFactor: .5, // reduce input image size .
    maxNumBoxes: 2, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.85, // confidence threshold for predictions.
}

let model;
let handPredictions;
var delay = 200;
var last = 0;
let count = 0;
let handDetector = true;


function setupCanvas(canvasElement, analyserNodeRef) {
    boxArray = [];

    // create drawing context
    ctx = canvasElement.getContext("2d");

    canvasWidth = canvasElement.width;
    canvasHeight = canvasElement.height;

    // keep a reference to the analyser node
    analyserNode = analyserNodeRef;

    // this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize / 2);



    videoElement = document.querySelector("video");
    if (handDetector) {
        handTrack.startVideo(videoElement)
            .then(status => {
            if (status) {
                navigator.getUserMedia({
                    video: {}
                }, stream => {
                    videoElement.srcObject = stream;

                }, err => {
                    console.log(err)
                })
            }
        })
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                audio: false,
                video: {
                    width: canvasWidth,
                    height: canvasHeight
                }
            },
                                   function (stream) {
                videoElement.srcObject = stream;
            },
                                   function (err) {
                console.log("The following error occurred: " + err.name);
            }
                                  );
        } else {
            console.log("getUserMedia not supported");
        }




        handTrack.load(modelParams).then(lmodel => {
            model = lmodel;
        })
    }

}

function draw(params = {}) {

    analyserNode.getByteFrequencyData(audioData);
    // OR

    // 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();


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

    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width; // not using here

    // 7 - Invert Colors
    if (params.showInvert) {
        let red = data[i],
            green = data[i + 1],
            blue = data[i + 2];
        data[i] = 255 - red; // set red value
        data[i + 1] = 255 - green; // set green value
        data[i + 2] = 255 - blue; // set blue value
        // data[i+3] is the alpha but we're leaving that alone
    }
    // end for
    // 8 - Emboss
    if (params.showEmboss) {
        // note we are stepping through *each* sub-pixel
        for (let i = 0; i < length; i++) {
            if (i % 4 == 3) continue; // skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        }
    }

    if (params.doHandGame) {
        runDetection(videoElement, audioData);
    }

    utils.drawRectangle(ctx, 100, 100, 50, 50, 'blue')
   
    for (let i = 0; i < audioData.length; i++) {

//        console.log(audioData[i])

        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate((Math.PI * 2 / audioData.length) * i)
        ctx.translate(50, 0)
        utils.drawRectangle(ctx, radius, 0, audioData[i], 10, 'red')
        ctx.restore();



    }

    //ctx.drawImage(videoElement, 0, 0, canvasWidth, canvasHeight);
    //ctx.putImageData(imageData, 0, 0);


}
 let radius = 100;

function runDetection(video, audioData) {
    //requestAnimationFrame(runDetection)
    if (model) model.detect(video).then(predictions => {
        for (let prediction of predictions) {
            //console.log(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3])
            let hand = {
                x: prediction.bbox[0],
                y: prediction.bbox[1],
                width: prediction.bbox[2],
                height: prediction.bbox[3]
            }

//HAND STUFF
            vanillaCircle(hand)
        }




    });


}


function visual1(hand) {
    utils.drawRectangle(ctx, hand.x, hand.y, hand.width, hand.height, "white")

}


function vanillaCircle(hand) {
    let maxRadius = hand.width / 2
    ctx.save();
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < audioData.length; i++) {
        // even lighter blue circles
        let percent = audioData[i] / 255;

        let circleRadius = percent * maxRadius;
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(72, 202, 228, .34 - percent / 3.0);
        ctx.arc(hand.x, hand.y, circleRadius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();

        // lighter blue, bigger, more transparent
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(0, 180, 216, .10 - percent / 10.0);
        ctx.arc(hand.x, hand.y, circleRadius * 1.5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();

        // dark blue circles, smaller
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(0, 150, 199, .5 - percent / 5.0);
        ctx.arc(hand.x, hand.y, circleRadius * .50, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    ctx.restore();
}
export {
    setupCanvas,
    draw,
    boxArray
};
