/**
 * Created by Tang-Tablet on 2017/5/20.
 */

'use strict';

class Data{
    constructor(){};
}

class Point extends Data{
    constructor() {
        super();
    }
}

class Line extends Data {
    constructor() {
        super();
    }
}

class Area extends Data {
    constructor() {
        super();
    }
}

class Land extends Area {
    constructor() {
        super();
    }
}

class Boarder extends Line {
    constructor() {
        super();
    }
}

class MetroStation extends Point {
    constructor(){
        super();
    }
}

class MetroLine extends Line {
    constructor() {
        super();
    }
}