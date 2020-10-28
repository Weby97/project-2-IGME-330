import * as utils from './utils.js';

class SoundBox {

    constructor(x, y, width, height, speed = 3,color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.color = color;
    }

    display(ctx) {
        utils.drawRectangle(ctx, this.x, this.y, this.width, this.height, this.color);
    }
    move() {
        this.x -= this.speed;
        if (this.x <= 0 - this.width) {
            this.destroy();
        }
    }

    destroy() {
        console.log("box destroyed");
    }

}

const clicked = (x, y, rectArray) => {
    let index = 0;
    let changed = false;
    for (let rect of rectArray){
        if(x >= rect.x && y >= rect.y && x < (rect.width + rect.x) && y < (rect.height + rect.y)){
            index = rectArray.indexOf(rect);
        }
    }
    if (changed){
        changed = false;
        rectArray.splice(index,1);
    }
}

export {
    SoundBox, clicked
}
