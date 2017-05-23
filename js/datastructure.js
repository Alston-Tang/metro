/**
 * Created by Alston on 2017/5/23.
 */

exports = {};

class LinkedList {
    constructor(val, next, prev) {
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
