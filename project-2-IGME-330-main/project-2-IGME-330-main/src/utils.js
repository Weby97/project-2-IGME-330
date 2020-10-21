// Why are the all of these ES6 Arrow functions instead of regular JS functions?
// No particular reason, actually, just that it's good for you to get used to this syntax
// For Project 2 - any code added here MUST also use arrow function syntax

const makeColor = (red, green, blue, alpha = 1) => {
	return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
	return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
	const floor = 35; // so that colors are not too bright or too dark 
	const getByte = () => getRandom(floor, 255 - floor);
	return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx, startX, startY, endX, endY, colorStops) => {
	let lg = ctx.createLinearGradient(startX, startY, endX, endY);
	for (let stop of colorStops) {
		lg.addColorStop(stop.percent, stop.color);
	}
	return lg;
};


const goFullscreen = (element) => {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullscreen) {
		element.mozRequestFullscreen();
	} else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	}
	// .. and do nothing if the method is not supported
};

const drawRectangle = (ctx, x, y, width, height, fillStyle = "black", lineWidth = 0, strokeStyle = "black") => {
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

export { makeColor, getRandomColor, getLinearGradient, goFullscreen, drawRectangle };