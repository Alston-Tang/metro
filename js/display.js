/**
 * Created by Tang-Tablet on 2017/5/30.
 */

"use strict";

exports = {};

class Player {
    constructor(canvasDom, data) {
        this.canvas = canvasDom;
        this.data = data;
    }
    get height() {
        return this.canvas.height;
    }
    get width() {
        return this.canvas.width;
    }
    arrangeStations() {

    }
}
exports.Player = Player;


module.exports = exports;