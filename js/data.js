/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';


class Data{
    constructor(){};
    static regStation(station) {
        if (Data.stations === undefined) {
            Data.stations = [];
        }
        station.id = Data.stations.length;
        Data.stations.push(station);
    }
    static changeStationType(station, newType) {
        if (Data.numTypes === undefined) {
            Data.numTypes = {};
        }
        if (Data.numTypes[newType] === undefined) {
            Data.numTypes[newType] = 0;
        }
        if (station.type !== undefined) {
            // numTypes[station.type] is impossible to be undefined if station.type !== undefined
            Data.numTypes[station.type]--;
        }
        Data.numTypes[newType]++;
    }
}
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
