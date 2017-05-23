/**
 * Created by Tang-Tablet on 2017/5/21.
 */

// Station creation

let assert = require('chai').assert;

let DataCollection = require('../js/data');

function getArbitraryStation() {
    for (let id in DataCollection.Data.stations) {
        if (DataCollection.Data.stations.hasOwnProperty(id)) {
            return DataCollection.Data.stations[id];
        }
    }
    return null;
}

describe('Data', function () {
    let firstStation = null;
    let secondStation = null;
    let firstLine = null;
    describe('Station', function () {
        describe("Create position", function () {
            before(function () {
                firstStation = new DataCollection.MetroStation('triangle', 30, -25);
                secondStation = new DataCollection.MetroStation('circle', 20, -25);
            });
            it('should has correct position', function () {
                assert.equal(firstStation.position.x, 30);
                assert.equal(firstStation.position.y, -25);
            });
            it('should update boundary correctly', function () {
                assert.equal(DataCollection.Data.boundary.x, 30);
                assert.equal(DataCollection.Data.boundary.y, 25);
            });
        });
        describe("Create station", function () {
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
            let aStation = null;
            let prevType = null;
            let numPrevType = -1;
            before(function () {
                aStation = getArbitraryStation();
                prevType = aStation.type;
                numPrevType = DataCollection.Data.numTypes[aStation.type];
            });
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
        });
        describe("Remove station", function () {
            let stationToRemove = null;
            let prevType = null;
            let numPrevType = -1;
            before(function () {
                stationToRemove = getArbitraryStation();
                prevType = getArbitraryStation().type;
                numPrevType = DataCollection.Data.numTypes[prevType];
                DataCollection.Data.removeStation(stationToRemove.id);
            });
            it ('should set field to undefined', function () {
                assert.equal(DataCollection.Data.stations[stationToRemove.id] === undefined, true);
            });
            it ('shuold decrease type count', function () {
                assert.equal(DataCollection.Data.numTypes[prevType], numPrevType - 1);
            });
        });
    });
    describe("Line", function () {
        describe("Create line", function () {
            before(function () {
                firstLine = new DataCollection.MetroLine(firstStation, secondStation);
            });
            it("should establish correct station link", function () {
                assert.equal(firstLine.linkHead.val === firstStation, true);
                assert.equal(firstLine.linkHead.next.val === secondStation, true);
                assert.equal(firstLine.linkHead.next.val === firstLine.linkTail.val, true);
            });
            it("should add an interval to Data", function () {
               assert.equal(DataCollection.Data.intervals[firstStation.id][secondStation.id], true);
               assert.equal(DataCollection.Data.intervals[secondStation.id][firstStation.id], true);
            });
            it('should be added an id by Data', function () {
                assert.isNumber(firstLine.id);
            });
            it('should be inserted to the Data', function() {
                assert.equal(DataCollection.Data.lines[firstLine.id], firstLine);
            });
        });
    })
});
