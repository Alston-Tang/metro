/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';

let LinkedList = require('./datastructure').LinkedList;


class Data{
    constructor(){};
    static regStation(station) {
        station.id = Data.nextStationId++;
        Data.stations[station.id] = station;
    }
    static changeStationType(station, newType) {
        if (Data._numTypes[newType] === undefined) {
            Data._numTypes[newType] = 0;
        }
        if (station.type !== undefined) {
            // _numTypes[station.type] is impossible to be undefined if station.type !== undefined
            Data._numTypes[station.type]--;
        }
        Data._numTypes[newType]++;
    }
    /*
        Return null if stationId is invalid
        Return instance removed if succeed
    */
    static removeStation(stationId) {
        if (! stationId in Data.stations) return null;
        let stationToRemove = Data.stations[stationId];
        delete Data.stations[stationId];
        Data.numTypes[stationToRemove.type]--;
        return stationToRemove;
    }
    static updateBoundary(x, y) {
        if (x > Data.boundary.x || x < -Data.boundary.x) {
            Data.boundary.x = Math.abs(x);
        }
        if (y > Data.boundary.y || y < -Data.boundary.y) {
            Data.boundary.y = Math.abs(y);
        }
    }
    static regInterval(stationA, stationB) {
        if (Data.intervals[stationA.id] === undefined) {
            Data.intervals[stationA.id] = {};
        }
        if (Data.intervals[stationB.id] === undefined) {
            Data.intervals[stationB.id] = {};
        }
        Data.intervals[stationA.id][stationB.id] = true;
        Data.intervals[stationB.id][stationA.id] = true;
    }
    
    static regLine(line) {
        line.id = Data.nextLineId++;
        Data.lines[line.id] = line;
    }
}
// Stations
Data.stations = {};
Data.nextStationId = 0;
// numTypes
Data._numTypes = {};
Data.numTypes = new Proxy(Data._numTypes, {
    get (receiver, name) {
        return receiver[name] === undefined ? 0 : receiver[name];
    }
});
// Boundary
Data.boundary = {x : 0, y : 0};
// Intervals
Data.intervals = {};
// Lines
Data.lines = {};
Data.nextLineId = 0;
exports.Data = Data;

class Point extends Data{
    constructor(x, y) {
        super();
        this.position = {x : x, y : y};
        Data.updateBoundary(x, y);
    }
}
exports.Point = Point;

class Line extends Data {
    constructor() {
        super();
    }
}
exports.Line = Line;

class Area extends Data {
    constructor() {
        super();
    }
}
exports.Area = Area;

class Segment extends Data {
    constructor() {
        super();
    }
}
exports.Segment = Segment;

class Land extends Area {
    constructor() {
        super();
    }
}
exports.Land = Land;

class Boarder extends Segment {
    constructor() {
        super();
    }
}
exports.Boarder = Boarder;

class MetroStation extends Point {
    set type(newType) {
        Data.changeStationType(this, newType);
        this._type = newType;
    }
    get type() {
        return this._type;
    }
    constructor(type, x, y) {
        super(x, y);
        this.type = type;
        Data.regStation(this);
    }
}
exports.MetroStation = MetroStation;

class MetroLine extends Line {
    constructor(headStation, tailStation) {
        super();
        this.linkHead = new LinkedList(headStation, null, null);
        this.linkTail = new LinkedList(tailStation, null, null);
        this.linkHead.append(this.linkTail);
        Data.regInterval(headStation, tailStation);
        Data.regLine(this);
    }
}
exports.MetroLine = MetroLine;


module.exports = exports;
