/**
 * Created by Tang-Tablet on 2017/5/30.
 */

"use strict";

exports = {};

class Player {
    constructor(canvasDom) {
        this.canvas = canvasDom;
    }
    get height() {
        return this.canvas.height;
    }
    get width() {
        return this.canvas.width;
    }
}
exports.Player = Player;


module.exports = exports;