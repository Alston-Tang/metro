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
        if (Data._numTypes[newType] === undefined) {
            Data._numTypes[newType] = 0;
        }
        if (station.type !== undefined) {
            // _numTypes[station.type] is impossible to be undefined if station.type !== undefined
            Data._numTypes[station.type]--;
        }
        Data._numTypes[newType]++;
    }
}
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
