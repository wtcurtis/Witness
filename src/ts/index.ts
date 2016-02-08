/// <reference path="Graph.ts" />
/// <reference path="Backtrack.ts" />
/// <reference path="Util.ts" />
/// <reference path="../../typings/main.d.ts" />
import _ = require('lodash');
import {CreateGrid, Node} from "./Graph";
import {Backtrack} from "./Backtrack";
import {cloneArray} from "./Util";
import {assert} from "./Util";
import {Graph} from "./Graph";
import {NodeTuple} from "./Graph";
import {totalInBt} from "./Backtrack";
import {clonePush} from "./Util";
import {notPresent} from "./Util";

function last<T>(a: T[]) {
    return a[a.length-1];
}

var n = 6;

var graph = CreateGrid(n, n);
var start: Node<number> = graph.NodeAt(0);
var end: Node<number> = graph.LastNode();


var solutions : number[][] = [];
var count = 0;

function noBacktrackOf<T>() {
    return (s: Node<T>[]) => {
        var l = s.length;
        if(l <= 1) return false;

        return s[l-1].Index() - s[l-2].Index() < 0;
    }
}

function noRejectOf<T>() { return () => false; }

Backtrack<Node<number>>(
    start,
    //noBacktrackOf<number>(),
    noRejectOf<number>(),
    (n: Node<number>[]) => last(n) === end,
    (s: Node<number>[]) => notPresent(s, last(s).Nodes()),
    (s: Node<number>[]) => {
        solutions.push(s.map(t => t.Data()));
        count++;
        if(count % 100000 === 0) console.log("Up to " + count + " distinct solutions");
    }
);

console.log("Found " + solutions.length
    + " unique solutions. Total iterations: " + totalInBt);

var smallest = _.minBy(solutions, s => s.length);
var largest = _.maxBy(solutions, s => s.length);

console.log('Smallest: ' + smallest + '(' + smallest.length + ')');
console.log('Largest: ' + largest + '(' + largest.length + ')');
