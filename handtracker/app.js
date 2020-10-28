navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

let video = document.querySelector("video");
let canvas = document.querySelector('#canvas')
let ctx = canvas.getContext('2d');
let canvasWidth = ctx.canvas.width
let canvasHeight = ctx.canvas.height

const modelParams = {
    flipHorizontal: false, // flip e.g for video 
    imageScaleFactor: .5, // reduce input image size .
    maxNumBoxes: 2, // maximum number of boxes to detect
    iouThreshold: 0.5, // ioU threshold for non-max suppression
    scoreThreshold: 0.85, // confidence threshold for predictions.
}

let model;
let handPredictions;


handTrack.startVideo(video)
    .then(status => {
        if (status) {
            navigator.getUserMedia({
                video: {}
            }, stream => {
                video.srcObject = stream;
                
                drawEffect();
                
                


            }, err => {
                console.log(err)
            })
        }
    })


handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
})



function runDetection() {
//requestAnimationFrame(runDetection)
    model.detect(video).then(predictions => {
        
        for(let prediction of predictions){
            //console.log(prediction.bbox[0],prediction.bbox[1],prediction.bbox[2],prediction.bbox[3])
            
            drawRectangle(ctx,prediction.bbox[0],prediction.bbox[1],30,30);
            
        }


        

    });


}


function drawRectangle(ctx, x, y, width, height, fillStyle = "black", lineWidth = 0, strokeStyle = "black") {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
    ctx.fill();
    if (lineWidth > 0) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
    ctx.restore();
};

function drawEffect() {
   
    runDetection();
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
   
    ctx.putImageData(imageData, 0, 0)
   // setInterval(runDetection,300)
    //ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
    requestAnimationFrame(drawEffect)
    
}
