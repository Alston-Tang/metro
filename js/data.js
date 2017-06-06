/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';

let LinkedList = require('./datastructure').LinkedList;
let XMLDomClass = require('xmldom').DOMImplementation;
let XMLDom = new XMLDomClass();
let XMLSerializer = require('xmldom').XMLSerializer;
let XMLParser = require('xmldom').DOMParser;


class MetroMap {
    constructor() {
        this.stations = {};
        this.stations[Symbol.iterator] = function*() {
            for (let id in this) {
                if (this.hasOwnProperty(id)) {
                    yield id;
                }
            }
        };
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
    /*
    id => a hint what id should be assigned
    throw error if id is already used
     */
    regStation : mapCheckWrapper(
        function(station, id) {
            if (id === undefined) {
                id = Data.map.nextStationId++;
            }
            if (Data.map.stations[id] !== undefined) {
                throw new Error("invalid id");
            }
            if (Data.map.nextStationId <= id) {
                Data.map.nextStationId = id + 1;
            }
            station.id = id;
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
    removeLine : mapCheckWrapper(
        function (lineId) {
            if (! lineId in Data.map.lines) return null;
            if (Data.map.lines[lineId].linkHead !== null || Data.map.lines[lineId].linkTail !== null) {
                throw new Error("try to remove non-empty line");
            }
            let lineToRemove = Data.map.lines[lineId];
            delete Data.map.lines[lineId];
            return lineToRemove;
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
    /*
     Return true if succeed
     Return false if interval not exists
     */
    removeInterval : mapCheckWrapper(
        function removeInterval(stationA, stationB, line) {
            if (!Data.hasInterval(stationA, stationB, line)) return false;
            delete Data.map.intervals[stationA.id][stationB.id][line.id];
            delete Data.map.intervals[stationB.id][stationA.id][line.id];
            return true;
        }
    ),
    /*
        id => a hint what id should be assigned
        throw error if id is already used
        Return true if succeed
        Return false if failed
     */
    regLine : mapCheckWrapper(
        function (line, id) {
            if (!line.linkHead || !line.linkTail || line.linkHead === line.linkTail) {
                return false;
            }
            if (id === undefined) {
                id = Data.map.nextLineId++;
            }
            if (Data.map.lines[id] !== undefined) {
                throw new Error("invalid id");
            }
            if (Data.map.nextLineId <= id) {
                Data.map.nextLineId = id + 1;
            }
            line.id = id;
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
    ),
    /*
     type => {xml}
     */
    parse: function (type, str) {
        switch (type) {
            case 'xml':
                return Data._parseXML(str);
        }
    },
    _parseXML(str) {
        let parser = new XMLParser();
        let doc = parser.parseFromString(str);
        if (!doc) return false;
        if (!doc.documentElement) return false;
        if (doc.documentElement.nodeName !== "Data") return false;

        Data.useMap(new MetroMap());

        // Insert Stations
        let stationsNode = doc.getElementsByTagName("Stations");
        if (stationsNode.length !== 1) return false;
        stationsNode = stationsNode[0];
        for (let stationNode of Array.from(stationsNode.childNodes)) {
            // Ignore text node : 1 => Element
            if (stationNode.nodeType !== 1) continue;
            if (!stationNode.hasAttribute('id') || !stationNode.hasAttribute('type')) {
                continue;
            }
            let positionNode = stationNode.getElementsByTagName("Position");
            if (positionNode.length !== 1) continue;
            positionNode = positionNode[0];
            if (!positionNode.hasAttribute('x') || !positionNode.hasAttribute('y')) continue;
            new MetroStation(
                stationNode.getAttribute('type'),
                parseFloat(positionNode.getAttribute('x')),
                parseFloat(positionNode.getAttribute('y')),
                parseInt(stationNode.getAttribute('id'))
            );
        }
        // Insert Lines
        let linesNode = doc.getElementsByTagName("Lines");
        if (linesNode.length !== 1) return false;
        linesNode = linesNode[0];
        for (let lineNode of Array.from(linesNode.childNodes)) {
            // Ignore text node : 1 => Element
            if (lineNode.nodeType !== 1) continue;
            if (!lineNode.hasAttribute('id')) continue;
            let refStations = lineNode.getElementsByTagName('StationRef');
            if (refStations.length < 2) continue;
            let headStationId = parseInt(refStations[0].getAttribute('refId'));
            let tailStationId = parseInt(refStations[1].getAttribute('refId'));
            let newLine = new MetroLine(Data.map.stations[headStationId], Data.map.stations[tailStationId], parseInt(lineNode.getAttribute('id')));
            let curId = 2;
            while (curId < refStations.length) {
                newLine.expand(Data.map.stations[parseInt(refStations[curId].getAttribute("refId"))], 'tail');
                curId++;
            }
        }
        return true;
    },
    serialize: mapCheckWrapper(
        function (type) {
            switch (type) {
                case "xml":
                    return Data._serializeXML();
            }
        }
    ),
    _serializeXML: function () {
        let doc = XMLDom.createDocument(null, "MetroMap");
        let lines = doc.createElement("Lines");
        let root = doc.createElement("Data");
        let stations = doc.createElement("Stations");
        root.appendChild(stations);
        root.appendChild(lines);
        // Insert Stations
        for (let stationId in Data.map.stations) {
            if (!Data.map.stations.hasOwnProperty(stationId))
                continue;
            let curStationNode = doc.createElement("Station");
            curStationNode.setAttribute("id", stationId);
            curStationNode.setAttribute("type", Data.map.stations[stationId].type);
            let positionNode = doc.createElement("Position");
            positionNode.setAttribute('x', Data.map.stations[stationId].position.x);
            positionNode.setAttribute('y', Data.map.stations[stationId].position.y);
            curStationNode.appendChild(positionNode);
            stations.appendChild(curStationNode);
        }
        // Insert lines
        for (let lineId in Data.map.lines) {
            if (!Data.map.lines.hasOwnProperty(lineId))
                continue;
            let curLineNode = doc.createElement("Line");
            let curStation = Data.map.lines[lineId].linkHead;
            while (curStation) {
                let stationRef = doc.createElement("StationRef");
                stationRef.setAttribute("refId", curStation.val.id);
                curLineNode.appendChild(stationRef);
                curStation = curStation.next;
            }
            curLineNode.setAttribute("id", lineId);
            lines.appendChild(curLineNode);
        }
        let xs = new XMLSerializer();
        return xs.serializeToString(root);
    }
};
Data.numTypes = new Proxy(Data, {
    get : function (receiver, name) {
        return receiver.map.numTypes[name] === undefined ? 0 : receiver.map.numTypes[name];
    }
});
Data.stations = new Proxy(Data, {
    get : mapCheckWrapper(function(receiver, name) {
        return receiver.map.stations[name];
    })
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
    constructor(type, x, y, id) {
        super(x, y);
        this.type = type;
        Data.regStation(this, id);
    }
}
exports.MetroStation = MetroStation;

class MetroLine extends Line {
    constructor(headStation, tailStation, id) {
        super();
        this.linkHead = new LinkedList(headStation);
        this.linkTail = new LinkedList(tailStation);
        this.linkHead.append(this.linkTail);
        Data.regLine(this, id);
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
        let matchingNode = this.linkHead.match(newStation, 'toTail');
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
     Return false if failed
     Return true if succeed
     direction => {'head', 'tail'}
     */
    shrink(direction) {
        if (direction === 'head') {
            if (!Data.removeInterval(this.linkHead.val, this.linkHead.next.val, this)) {
                return false;
            }
            this.linkHead = this.linkHead.next;
        }
        else if(direction === 'tail') {
            if (!Data.removeInterval(this.linkTail.val, this.linkTail.prev.val, this)) {
                return false;
            }
            this.linkTail = this.linkTail.prev;
        }
        else return false;
        if (this.linkHead === this.linkTail) {
            this.linkHead = null;
            this.linkTail = null;
            if (!Data.removeLine(this.id)) {
                throw new Error("remove line failed");
            }
        }
        return true;
    }
    /*
     Return false if failed
     Return true if succeed
     direction => {'head', 'tail'}
     station => excluded after shrinking
     */
    shrinkToStation(direction, station) {
        if (this.linkHead.match(station, 'toTail') === null) return false;
        if (direction === 'head') {
            let cur = this.linkHead;
            while (cur.next !== null) {
                this.shrink('head');
                if (cur.val === station) break;
                cur = cur.next;
            }
        }
        else if(direction === 'tail') {
            let cur = this.linkTail;
            while (cur.prev !== null) {
                this.shrink('tail');
                if (cur.val === station) break;
                cur = cur.prev;
            }
        }
        else return false;
        return true;
    }
}
exports.MetroLine = MetroLine;


module.exports = exports;
