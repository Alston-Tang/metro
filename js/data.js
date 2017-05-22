/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';


class Data{
    constructor(){};
    static regStation(station) {
        if (Data.stations === undefined) {
            Data.stations = {};
        }
        station.id = Data.nextId++;
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
}
Data.nextId = 0;
Data._numTypes = {};
Data.numTypes = new Proxy(Data._numTypes, {
    get (receiver, name) {
        return receiver[name] === undefined ? 0 : receiver[name];
    }
});
exports.Data = Data;

class Point extends Data{
    constructor() {
        super();
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
    constructor(type) {
        super();
        Data.regStation(this);
        this.type = type;
    }
}
exports.MetroStation = MetroStation;

class MetroLine extends Line {
    constructor() {
        super();
    }
}
exports.MetroLine = MetroLine;


module.exports = exports;
