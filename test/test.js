/**
 * Created by Tang-Tablet on 2017/5/21.
 */

// Station creation

let assert = require('chai').assert;

let DataCollection = require('../js/data');

describe('Station', function () {
    describe("Create station", function () {
        let firstStation = new DataCollection.MetroStation('triangle');
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
    describe("Modify type", function () {
        let aStation = DataCollection.Data.stations[0];
        let prevType = aStation.type;
        let numPrevType = DataCollection.Data.numTypes[aStation.type];
        it ('should make no difference if new type is equal to old one', function () {
            aStation.type = prevType;
            assert.equal(DataCollection.Data.stations[aStation.id].type, prevType);
            assert.equal(DataCollection.Data.numTypes[prevType], numPrevType);
        });
        it ('should make difference if new type is not equal to old one', function () {
            let newType = prevType + '_new';
            let numNewType = DataCollection.Data.numTypes[newType];
            aStation.type = newType;
            assert.equal(DataCollection.Data.stations[aStation.id].type, newType);
            assert.equal(DataCollection.Data.numTypes[prevType], numPrevType - 1);
            assert.equal(DataCollection.Data.numTypes[newType], numNewType + 1);
        });
    })
});