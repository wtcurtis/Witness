///<reference path="Util.ts"/>
///<reference path="../../typings/main.d.ts" />
import {assert} from "./Util";
import _ = require('lodash');
export class Graph<T> {
    private nodes: Node<T>[];
    private edges: [number, number][];

    constructor(nodes: T[], edges: [number, number][]) {
        this.edges = edges;
        this.nodes = _.map(nodes, (n, i) => new Node(n, i));

        _.each(this.edges, t => {
            var a = this.nodes[t[0]];
            var b = this.nodes[t[1]];

            assert(a !== undefined, "No node %s", t[0]);
            assert(b !== undefined, "No node %s", t[1]);

            a.AddNode(b); b.AddNode(a);
        });

        this.nodes.forEach(n => console.log(n.Data(), n.Nodes().map(n => n.Data()).join(', ')));
    }

    NodeAt(index: number) { return this.nodes[index]; }

    LastNode() { return this.nodes[this.nodes.length - 1]; }

    NodeCount() { return this.nodes.length; }

    WriteIndices(indices: NodeTuple[]) {
        return indices.map(i => this.NodeAt(i[0]).Data()).join(', ');
    }

    WriteNodes(nodes: Node<T>[]) {
        return nodes.map(n => n.Data()).join(', ');
    }
}

export type NodeTuple = [number, number];

export function CreateGrid(x: number, y: number) {
    var n = x * y;
    var indices = _.range(n);

    var getEdges = (i: number, edges: [number, number][]) => {
        var row = Math.floor(i / x);
        var col = i % x;

        if(row < y-1) edges.push([i, i+x]);
        if(col < x-1) edges.push([i, i+1]);

        return edges;
    };

    var edges : [number, number][] = [];
    _.each(indices, i => getEdges(i, edges));

    return new Graph(indices, edges);
}

export class Node<T> {
    private data: T;
    private index: number;
    private nodes: Node<T>[];
    private extra: {[s: string]: any};

    constructor(data: T, index: number) {
        this.data = data;
        this.nodes = [];

        this.index = index;
    }

    AddNode(node: Node<T>) {
        this.nodes.push(node);
        return this;
    }

    SetExtra(key: string, value: any) {
        this.extra[key] = value;
        return this;
    }

    GetExtra(key: string) {
        return this.extra[key];
    }

    AdjacentAt(index: number) {
        return this.nodes.length >= index-1
            ? this.nodes[index]
            : null;
    }

    Data() { return this.data; }

    Nodes() {
        return this.nodes;
    }

    NextAt(i: number) {
        return this.nodes[i];
    }

    Index() { return this.index; }
}
