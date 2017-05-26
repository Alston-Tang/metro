/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';

let LinkedList = require('./datastructure').LinkedList;

class MetroMap {
    constructor() {
        this.stations = {};
        this.nextStationId = 0;
        this.numTypes = {};
        this.boundary = {x : 0, y : 0};
        this.intervals = {};
        this.lines = {};
        this.nextLineId = 0;
    }
}
exports.MetroMap = MetroMap;

function _mapCheck(target, thisArg, argList) {
    if (Data.map !== null) {
        return target.apply(thisArg, argList);
    }
    throw "no map instance";
}

function mapCheckWrapper(fn) {
    return new Proxy(fn, {
        apply: _mapCheck
    });
}

let Data = {
    map : null,
    useMap(map) {
        this.map = map;
    },
    regStation : mapCheckWrapper(
        function(station) {
            station.id = Data.map.nextStationId++;
            Data.map.stations[station.id] = station;
        }
    ),
    changeStationType : mapCheckWrapper(
        function(station, newType) {
            if (Data.map.numTypes[newType] === undefined) {
                Data.map.numTypes[newType] = 0;
            }
            if (station.type !== undefined) {
                // _numTypes[station.type] is impossible to be undefined if station.type !== undefined
                Data.map.numTypes[station.type]--;
            }
            Data.map.numTypes[newType]++;
        }
    ),
    /*
     Return null if stationId is invalid
     Return instance removed if succeed
     */
    removeStation : mapCheckWrapper(
        function(stationId) {
            if (! stationId in Data.map.stations) return null;
            let stationToRemove = Data.map.stations[stationId];
            delete Data.map.stations[stationId];
            Data.map.numTypes[stationToRemove.type]--;
            return stationToRemove;
        }
    ),
    updateBoundary : mapCheckWrapper(
        function (x, y) {
            if (x > Data.map.boundary.x || x < -Data.map.boundary.x) {
                Data.map.boundary.x = Math.abs(x);
            }
            if (y > Data.map.boundary.y || y < -Data.map.boundary.y) {
                Data.map.boundary.y = Math.abs(y);
            }
        }
    ),
    regInterval : mapCheckWrapper(
        function (stationA, stationB, line) {
            if (Data.map.intervals[stationA.id] === undefined) {
                Data.map.intervals[stationA.id] = {};
            }
            if (Data.map.intervals[stationB.id] === undefined) {
                Data.map.intervals[stationB.id] = {};
            }
            if (Data.map.intervals[stationA.id][stationB.id] === undefined) {
                Data.map.intervals[stationA.id][stationB.id] = {};
            }
            if (Data.map.intervals[stationB.id][stationA.id] === undefined) {
                Data.map.intervals[stationB.id][stationA.id] = {};
            }
            Data.map.intervals[stationA.id][stationB.id][line.id] = true;
            Data.map.intervals[stationB.id][stationA.id][line.id] = true;
        }
    ),
    removeInterval : mapCheckWrapper(
        function removeInterval(stationA, stationB) {

        }
    ),
    /* Return true if succeed
       Rerturn false if failed
     */
    regLine : mapCheckWrapper(
        function (line) {
            if (!line.linkHead || !line.linkTail || line.linkHead === line.linkTail) {
                return false;
            }
            line.id = Data.map.nextLineId++;
            Data.map.lines[line.id] = line;
            let cur = line.linkHead;
            while (cur.next) {
                Data.regInterval(cur.val, cur.next.val, line);
                cur = cur.next;
            }
            return true;
        }
    ),
    hasInterval : mapCheckWrapper(
        function (stationA, stationB, line) {
            if (Data.map.intervals[stationA.id] === undefined || Data.map.intervals[stationB.id] === undefined) return false;
            if (Data.map.intervals[stationA.id][stationB.id] === undefined || Data.map.intervals[stationB.id][stationA.id] === undefined) return false;
            if (line === undefined) return true;
            return (!!Data.map.intervals[stationA.id][stationB.id][line.id]) && (!!Data.map.intervals[stationB.id][stationA.id][line.id]);
        }
    )
};
Data.numTypes = new Proxy(Data, {
    get (receiver, name) {
        return receiver.map.numTypes[name] === undefined ? 0 : receiver.map.numTypes[name];
    }
});
exports.Data = Data;

class Point{
    constructor(x, y) {
        this.position = {x : x, y : y};
        Data.updateBoundary(x, y);
    }
}
exports.Point = Point;

class Line {
    constructor() {
    }
}
exports.Line = Line;

class Area {
    constructor() {
    }
}
exports.Area = Area;

class Segment {
    constructor() {
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
        this.linkHead = new LinkedList(headStation);
        this.linkTail = new LinkedList(tailStation);
        this.linkHead.append(this.linkTail);
        Data.regLine(this);
    }
    /*
     Return false if expand failed
     Return true if succeed
     direction => {'head', 'tail'}
     */
    expand(newStation, direction) {
        if (direction !== 'head' && direction !== 'tail') {
            return false;
        }
        let matchingNode = this.linkHead.match(newStation, 'forward');
        if (direction === 'head') {
            if (matchingNode && matchingNode !== this.linkTail) return false;
            let newNode = new LinkedList(newStation);
            newNode.append(this.linkHead);
            this.linkHead = this.linkHead.prev;
            Data.regInterval(this.linkHead.val, this.linkHead.next.val, this);
            return true;
        }
        else if (direction === 'tail') {
            if (matchingNode && matchingNode !== this.linkHead) return false;
            let newNode = new LinkedList(newStation);
            this.linkTail.append(newNode);
            this.linkTail = this.linkTail.next;
            Data.regInterval(this.linkTail.prev.val, this.linkTail.val, this);
            return true;
        }
        else return false;
    }
    /*
     Return false if expand failed
     Return true if succeed
     direction => {'head', 'tail'}
     */
    shrink(direction) {
        if (this.linkHead.next === this.linkTail) {
            //TODO Remove Line
            return false;
        }
        if (direction === 'head') {
            this.linkHead = this.linkHead.next;
        }
        else if (direction === 'tail') {
            this.linkTail = this.linkTail.prev;
        }
    }
}
exports.MetroLine = MetroLine;


module.exports = exports;
