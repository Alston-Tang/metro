/**
 * Created by Tang-Tablet on 2017/5/26.
 */


let assert = require('chai').assert;

let DataCollection = require('../js/data');

describe("NullData", function () {
    it('should throw error', function () {
        assert.throw(function () {
            DataCollection.Data.map = null;
            new DataCollection.MetroStation('error', 0, 0);
        }, "no map instance");
    });
});
