/**
 * Created by Tang-Tablet on 2017/5/21.
 */

// Station creation

let XMLSerializerClass = require('xmldom').XMLSerializer;
let XMLSerializer = new XMLSerializerClass();
let fs = require('fs');

let assert = require('chai').assert;

let DataCollection = require('../js/data');
let Data = new Proxy(DataCollection.Data, {get(receiver, name){
    if (receiver[name] !== undefined) return receiver[name];
    if (receiver.map !== null) {
        return receiver.map[name];
    }
}});

function getArbitraryStation() {
    for (let id in Data.stations) {
        if (Data.stations.hasOwnProperty(id)) {
            return Data.stations[id];
        }
    }
    return null;
}
describe('Data', function () {
    let firstStation = null;
    let secondStation = null;
    let firstLine = null;
    let secondLine = null;
    let thirdStation = null;
    let fourthStation = null;
    let dataTestMap = null;
    before(function () {
        dataTestMap = new DataCollection.MetroMap();
        DataCollection.Data.useMap(dataTestMap);
    });
    describe('Station', function () {
        describe("Create position", function () {
            before(function () {
                firstStation = new DataCollection.MetroStation('triangle', 30, -25);
                secondStation = new DataCollection.MetroStation('circle', 20, -25, 5);
            });
            it('should has correct position', function () {
                assert.equal(firstStation.position.x, 30);
                assert.equal(firstStation.position.y, -25);
            });
            it('should update boundary correctly', function () {
                assert.equal(Data.boundary.x, 30);
                assert.equal(Data.boundary.y, 25);
            });
        });
        describe("Create station", function () {
            it ('should throw error for a wrong id hint', function () {
                assert.throw(function () {
                    new DataCollection.MetroStation('wrong', 0, 0, 0);
                }, "invalid id");
            });
            it('should has correct nextStationId', function () {
                assert.equal(Data.nextStationId, 6);
            });
            it('should be added an id by Data', function () {
                assert.isNumber(firstStation.id, "ID is " + firstStation.id);
            });
            it('should be inserted to the Data', function() {
                assert.equal(Data.stations[firstStation.id], firstStation);
            });
            it('should has the correct type', function () {
                assert.equal(firstStation.type, 'triangle');
                assert.equal(Data.numTypes.triangle, 1);
            })
        });
        describe("Modify type", function () {
            let aStation = null;
            let prevType = null;
            let numPrevType = -1;
            before(function () {
                aStation = getArbitraryStation();
                prevType = aStation.type;
                numPrevType = Data.numTypes[aStation.type];
            });
            it ('should make no difference if new type is equal to old one', function () {
                aStation.type = prevType;
                assert.equal(Data.stations[aStation.id].type, prevType);
                assert.equal(Data.numTypes[prevType], numPrevType);
            });
            it ('should make difference if new type is not equal to old one', function () {
                let newType = prevType + '_new';
                let numNewType = Data.numTypes[newType];
                aStation.type = newType;
                assert.equal(Data.stations[aStation.id].type, newType);
                assert.equal(Data.numTypes[prevType], numPrevType - 1);
                assert.equal(Data.numTypes[newType], numNewType + 1);
            });
        });
        /*
        describe("Remove station", function () {
            let stationToRemove = null;
            let prevType = null;
            let numPrevType = -1;
            before(function () {
                stationToRemove = getArbitraryStation();
                prevType = getArbitraryStation().type;
                numPrevType = Data.numTypes[prevType];
                Data.removeStation(stationToRemove.id);
            });
            it ('should set field to undefined', function () {
                assert.equal(Data.stations[stationToRemove.id] === undefined, true);
            });
            it ('shuold decrease type count', function () {
                assert.equal(Data.numTypes[prevType], numPrevType - 1);
            });
        });
        */
    });
    describe("Line", function () {
        describe("Create line", function () {
            before(function () {
                firstLine = new DataCollection.MetroLine(firstStation, secondStation);
                secondLine = new DataCollection.MetroLine(firstStation, secondStation, 5);
            });
            it("should thorw error", function () {
                assert.throw(function () {
                    new DataCollection.MetroLine(firstStation, secondStation, 0);
                }, "invalid id");
            });
            it("should have correct nextLineId", function () {
                assert.equal(Data.nextLineId, 6);
            });
            it("should establish correct station link", function () {
                assert.equal(firstLine.linkHead.val === firstStation, true);
                assert.equal(firstLine.linkHead.next.val === secondStation, true);
                assert.equal(firstLine.linkHead.next.val === firstLine.linkTail.val, true);
            });
            it("should add an interval to Data", function () {
               assert.equal(Data.hasInterval(firstStation, secondStation, firstLine), true);
            });
            it('should be added an id by Data', function () {
                assert.isNumber(firstLine.id);
            });
            it('should be inserted to the Data', function() {
                assert.equal(Data.lines[firstLine.id], firstLine);
            });
        });
        describe("Expand line", function () {
            before(function () {
               thirdStation = new DataCollection.MetroStation('rectangle', 0, 0);
               fourthStation = new DataCollection.MetroStation('rectangle', 0, -25);
            });
            it('should add third station to the tail', function () {
                assert.equal(firstLine.expand(thirdStation, 'tail'), true);
                assert.equal(firstLine.linkTail.val, thirdStation);
                assert.equal(firstLine.linkTail.prev.val, secondStation);
                assert.equal(firstLine.linkTail.prev.next.val, thirdStation);
            });
            it('should add fourth station to the head', function () {
                assert.equal(firstLine.expand(fourthStation, 'head'), true);
                assert.equal(firstLine.linkHead.val, fourthStation);
                assert.equal(firstLine.linkHead.next.val, firstStation);
                assert.equal(firstLine.linkHead.next.prev.val, fourthStation);
            });
            // firstLine 4<->1<->2<->3
            it('should return false if we try to add 2nd station', function () {
                assert.equal(firstLine.expand(secondStation, 'head'), false);
                assert.equal(firstLine.expand(secondStation, 'tail'), false);
            });
            it('should form a ring if we try to add 4th station to the tail', function () {
                assert.equal(firstLine.expand(fourthStation, 'tail'), true);
                assert.equal(firstLine.linkHead.val, fourthStation);
                assert.equal(firstLine.linkTail.val, fourthStation);
            });
            // firstLine 4<->1<->2<->3<->4
            it('shuold update intervals in Data', function () {
                assert.equal(Data.hasInterval(fourthStation, firstStation, firstLine), true);
                assert.equal(Data.hasInterval(firstStation, secondStation, firstLine), true);
                assert.equal(Data.hasInterval(secondStation, thirdStation, firstLine), true);
                assert.equal(Data.hasInterval(thirdStation, fourthStation, firstLine), true);
                assert.equal(Data.hasInterval(secondStation, fourthStation, firstLine), false);
            });
        });
        describe("shrink line", function () {
            it('should shrink stations chain and remove interval : head', function () {
                assert.equal(firstLine.shrink('head'), true);
                assert.equal(firstLine.linkHead.val, firstStation);
                assert.equal(Data.hasInterval(firstStation, fourthStation, firstLine), false);
            });
            it("should shrink stations chain and remove interval : tail", function () {
                assert.equal(firstLine.shrink('tail'), true);
                assert.equal(firstLine.linkTail.val, thirdStation);
                assert.equal(Data.hasInterval(fourthStation, thirdStation, firstLine), false);
            });
            // firstLine 1<->2<->3
            it("should keep intervals correct", function () {
                assert.equal(Data.hasInterval(firstStation, secondStation, firstLine), true);
                assert.equal(Data.hasInterval(thirdStation, secondStation, firstLine), true);
            });
            it ('should remove line', function () {
                assert.equal(firstLine.shrink('tail'), true);
                assert.equal(firstLine.shrink('tail'), true);
                assert.equal(Data.hasInterval(firstStation, secondStation, firstLine), false);
                assert.equal(Data.hasInterval(thirdStation, secondStation, firstLine), false);
                assert.equal(Data.lines[firstLine.id], undefined);
                assert.equal(Object.keys(Data.lines).length, 1);
            });
        });
    });
    describe("Serialize and parse", function () {
        before(function () {
        });
        it('shuold be idempotent', function () {
            let str = Data.serialize('xml');
            Data.parse('xml', str);
            let str2 = Data.serialize('xml');
            assert.equal(str, str2);
        });
        it('shuold be idempotent 2', function () {
            let str = fs.readFileSync('test/testmap/shrinkToStation.xml', 'utf-8');
            Data.parse('xml', str);
            let str2 = Data.serialize('xml');
            Data.parse(str2);
            let str3 = Data.serialize('xml');
            assert.equal(str2, str3);
        });
    });
});
