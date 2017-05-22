/**
 * Created by Tang-Tablet on 2017/5/21.
 */

// Station creation

let assert = require('chai').assert;

let DataCollection = require('../js/data');

describe('Station', function () {
    describe("Create station", function () {
        let firstStation = null;
        before(function () {
            firstStation = new DataCollection.MetroStation('triangle');
        });
        it('should be added an id by Data', function () {
            assert.isNumber(firstStation.id, "ID is " + firstStation.id);
        });
        it('should be inserted to the Data', function() {
            assert.equal(DataCollection.Data.stations[firstStation.id], firstStation);
        });
        it('should has the correct type', function () {
            assert.equal(firstStation.type, 'triangle');
            assert.equal(DataCollection.Data.numTypes.triangle, 1);
        })
    });
});