/**
 * Created by Tang-Tablet on 2017/5/30.
 */


let assert = require('chai').assert;

let DataCollection = require('../../js/data');
let Display = require('../../js/display');
let Helper = require('../../js/helper');

describe("Display", function () {
    let player = null;
    describe("Construct player", function () {
        before(function () {
            player = new Display.Player(document.getElementById("stage"), DataCollection.Data);
        });
        it("should load correctly load canvas dom", function () {
            assert.equal(player.canvas, document.getElementById("stage"));
            assert.equal(parseInt(player.height), 700);
            assert.equal(parseInt(player.width), 1000);
        });
    });
    describe("Set data", function () {
        before(function (done) {
            Helper.ajaxGet('../testmap/shrinkToStation.xml', function (str) {
                player.data.parse('xml', str);
                done();
            });
        });
        it("should parse data from xml", function () {
            assert.equal(Object.keys(player.data.map.stations).length, 4);
            assert.equal(Object.keys(player.data.map.lines).length, 1);
        });
    });
});
