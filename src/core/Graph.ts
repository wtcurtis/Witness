///<reference path="Util.ts"/>
///<reference path="../../typings/main.d.ts" />
import {assert} from "./Util";
import _ = require('lodash');
export class Graph<T> {
    public nodes: Node<T>[];
    private edges: [number, number][];

    constructor(nodes: T[], edges: [number, number][]) {
        this.edges = edges;
        this.nodes = _.map(nodes, (n, i) => new Node(n, i));

        _.each(this.edges, t => {
            const a = this.nodes[t[0]];
            const b = this.nodes[t[1]];

            assert(a !== undefined, "No node %s", t[0]);
            assert(b !== undefined, "No node %s", t[1]);

            a.AddNode(b); b.AddNode(a);
        });
    }

    /**
     * Does not actually delete the node, just makes it unreachable. This way, the
     * index numbers don't change.
     *
     * @param index
     * @returns {Graph}
     * @constructor
     */
    DeleteNodeAt(index: number) {
        this.nodes.forEach(n => n.DeleteEdgeWithIndex(index));
        this.NodeAt(index).ClearEdges();

        return this;
    }

    DeleteEdgeFromIndex(from: number, to: number) {
        return this.DeleteEdgeFrom(this.NodeAt(from), this.NodeAt(to));
    }

    NodeIsConnected(index: number) {
        const node = this.NodeAt(index);
        return node && node.Nodes().length > 0;
    }

    DeleteEdgeFrom(from: Node<T>, to: Node<T>) {
        const fromEdgeIndex = _.find(from.Nodes(), n => n.Index() === to.Index()).Index();
        const toEdgeIndex = _.find(to.Nodes(), n => n.Index() === from.Index()).Index();

        if(fromEdgeIndex !== -1) from.DeleteEdgeWithIndex(fromEdgeIndex);
        if(toEdgeIndex !== -1) to.DeleteEdgeWithIndex(toEdgeIndex);

        return this;
    }

    NodeAt(index: number) { return this.nodes[index]; }

    LastNode() { return this.nodes[this.nodes.length - 1]; }

    NodeCount() { return this.nodes.length; }
}

export type NodeTuple = [number, number];

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

    Data() { return this.data; }

    Nodes() {
        return this.nodes;
    }

    NextAt(i: number) {
        return this.nodes[i];
    }

    Index() { return this.index; }

    DeleteEdgeWithIndex(index: number) {
        const toDeleteIndex = _.findIndex(this.nodes, n => n.Index() == index);
        if(toDeleteIndex === -1) return this;

        this.nodes.splice(toDeleteIndex, 1);
        return this;
    }

    ConnectedTo(index: number) {
        for(let i = 0; i < this.nodes.length; i++) {
            if(index === this.nodes[i].Index()) return true;
        }

        return false;
    }

    ClearEdges() {
        this.nodes = [];
    }
}
