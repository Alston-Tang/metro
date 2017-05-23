/**
 * Created by Alston on 2017/5/23.
 */

exports = {};

class LinkedList {
    /*
     Return null if no matching
     Return LinkedList instance if matching
     direction => {'forward', 'backward', 'bidirectional'}
     */
    match(val, direction) {
        if (direction === 'forward' || direction === 'bidirectional') {
            let cur = this;
            while (cur) {
                if (cur.val === val) return cur;
                cur = cur.next;
            }
        }
        if (direction === 'backward' || direction === 'bidirectional') {
            let cur = this;
            while (cur) {
                if (cur.val === this.val) return cur;
                cur = cur.prev;
            }
        }
        return null;
    }
    constructor(val, next = null, prev = null) {
        this.val = val;
        this.next = next;
        this.prev = prev;
    }
    append(listNode) {
        this.next = listNode;
        listNode.prev = this;
    }
}
exports.LinkedList = LinkedList;

module.exports = exports;
