/// <reference path="Graph.ts" />
/// <reference path="Backtrack.ts" />
/// <reference path="Util.ts" />
/// <reference path="Grid.ts" />
/// <reference path="../../typings/main.d.ts" />
import _ = require('lodash');
import {Backtrack, totalInBt} from "./Backtrack";
import {Node, Graph} from "./Graph";
import {cloneArray, assert, clonePush, notPresent, last} from "./Util";
import {createGridGraph} from "./Grid";
import {Grid} from "./Grid";
import {Stack} from "./Stack";

var n = 6;

var grid = new Grid(n, n);
var drawNodes = (n: Node<number>[]) => n.map(n => n.Data()).join(', ');

//var logConnected = (from: [number, number], to: [number, number], breakEdges: Node<number>[])  => {
//    console.log("connected from " + from + " to " + to + ": " + grid.CellsConnected(from[0], from[1], to[0], to[1], breakEdges));
//};
//
//var testSolution = (breakIndexes: number[], pairs: [[number, number], [number, number]]) => {
//    const breakEdges = breakIndexes.map(n => grid.Graph().NodeAt(n));
//
//    _.each(pairs, p => {
//        const [from, to] = p;
//        logConnected(from, to, breakEdges);
//    });
//
//    console.log('solution: ' + drawNodes(breakEdges));
//};
//
//var indexes = [0, 6, 12, 18, 24, 30].map(n => n + 3);
//testSolution(indexes, [
//    [[2, 0], [3, 0]],
//    [[2, 1], [3, 1]],
//    [[2, 2], [3, 2]],
//    [[0, 0], [1, 0]],
//    [[0, 1], [1, 1]],
//    [[0, 2], [1, 2]],
//]);
//
//var indexes = [12, 13, 14, 15, 16, 17];
//testSolution(indexes, [
//    [[0, 1], [0, 2]],
//    [[1, 1], [1, 2]],
//    [[2, 1], [2, 2]],
//    [[0, 3], [0, 4]],
//    [[1, 3], [1, 4]],
//    [[2, 3], [2, 4]],
//    [[0, 2], [0, 3]],
//    [[1, 2], [1, 3]],
//    [[2, 2], [2, 3]],
//]);


//var region = grid.FloodFill(0, 0, [0, 6, 12, 18, 24, 30].map(n => grid.Graph().NodeAt(n + 2)));

//console.log(region.map((n, i) => n ? i : null).filter(i => i !== null));

var region = grid.DetermineAllRegions([18, 19, 20, 14, 8, 2].map(n => grid.Graph().NodeAt(n)));
console.log(region);

var region = grid.DetermineAllRegions([6, 7, 1, 2, 3, 4, 10, 11].map(n => grid.Graph().NodeAt(n)));
console.log(region);

//var region = grid.FloodFill(0, 0, [18, 19, 20, 14, 8, 2].map(n => grid.Graph().NodeAt(n)), []);
//console.log(region.map((n, i) => n ? i : null).filter(i => i !== null));
//
//var region = grid.FloodFill(3, 3, [18, 19, 20, 14, 8, 2].map(n => grid.Graph().NodeAt(n)), []);
//console.log(region.map((n, i) => n ? i : null).filter(i => i !== null));
//
//var region = grid.FloodFill(0, 0, [6, 7, 1].map(n => grid.Graph().NodeAt(n)), []);
//console.log(region.map((n, i) => n ? i : null).filter(i => i !== null));
//
//var region = grid.FloodFill(1, 1, [6, 7, 1, 2, 3, 4, 10, 11].map(n => grid.Graph().NodeAt(n)), []);
//console.log(region.map((n, i) => n ? i : null).filter(i => i !== null));
//console.log(drawNodes(grid.EdgeNodes()));

//grid.DeleteNode(0)
//    .DeleteNode(5)
//    .DeleteNode(35)
//    .DeleteNode(30);

//console.log(drawNodes(grid.EdgeNodes()));

//var graph = createGridGraph(n, n);
//var start: Node<number> = graph.NodeAt(0);
//var end: Node<number> = graph.LastNode();

//var solutions : number[][] = [];
//var count = 0;

//function noBacktrackOf<T>() {
//    return (s: Node<T>[]) => {
//        var l = s.length;
//        if(l <= 1) return false;
//
//        return s[l-1].Index() - s[l-2].Index() < 0;
//    }
//}

//function noRejectOf<T>() { return () => false; }

//console.log("total iterations: " + totalInBt);
//Backtrack<Node<number>>(
//    start,
//    noBacktrackOf<number>(),
//    //noRejectOf<number>(),
//    (n: Node<number>[]) => last(n) === end,
//    (s: Node<number>[]) => notPresent(s, last(s).Nodes()),
//    (s: Node<number>[]) => {
//        solutions.push(s.map(t => t.Data()));
//        count++;
//        if(count % 100000 === 0) console.log("Up to " + count + " distinct solutions");
//    }
//);
//
//console.log("Found " + solutions.length
//    + " unique solutions. Total iterations: " + totalInBt);
//
//var smallest = _.minBy(solutions, s => s.length);
//var largest = _.maxBy(solutions, s => s.length);
//
//console.log('Smallest: ' + smallest + '(' + smallest.length + ')');
//console.log('Largest: ' + largest + '(' + largest.length + ')');
