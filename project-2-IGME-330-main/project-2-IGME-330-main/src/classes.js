import * as utils from './utils.js';

class SoundBox {

    constructor(x, y, width, height, speed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }

    display(ctx) {
        utils.drawRectangle(ctx, this.x, this.y, this.width, this.height, "blue")
    }
    move() {
        this.x -= this.speed;
        if (this.x <= 0 - this.width) {
            this.destroy();
        }
    }

    destroy() {

        console.log("box destroyed")
    }

    clicked() {

        console.log("box clicked")

    }



}

export {
    SoundBox
}
