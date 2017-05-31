/**
 * Created by Tang-Tablet on 2017/5/30.
 */


let assert = require('chai').assert;

let DataCollection = require('../../js/data');
let Display = require('../../js/display');

describe("Construct player", function () {
    let player = null;
    before(function () {
        player = new Display.Player(document.getElementById("stage"));
    });
    it("should load correctly load canvas dom", function () {
        assert.equal(parseInt(player.height), 700);
        assert.equal(parseInt(player.width), 1000);
    });
});