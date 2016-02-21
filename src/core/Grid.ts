import {Graph, Node} from "./Graph";
import _ = require('lodash');
import {Backtrack} from "./Backtrack";
import {notPresent} from "./Util";
import {last} from "./Util";
import {Stack} from "./Stack";
/**
 * Point here is to set up a grid of cells that exist between the edges
 * of a grid-shaped graph. E.g., where C is a cell, N is a node, line is
 * an edge:
 *
 * N-N-N
 * |C|C|
 * N-N-N
 * |C|C|
 * N-N-N
 *
 * This'll let us set up closed regions of the grid defined by connected
 * nodes.
 */
export class Grid {
    private x: number;
    private y: number;
    private cellX: number;
    private cellY: number;
    private graph: Graph<number>;
    private regionGraph: Graph<number>;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.cellX = x-1;
        this.cellY = y-1;

        this.graph = createGridGraph(x, y);
        this.regionGraph = createGridGraph(x, y, true);
    }

    Graph() { return this.graph; }

    DeleteNode(index: number) {
        this.graph.DeleteNodeAt(index);
        this.regionGraph.DeleteNodeAt(index);
        return this;
    }

    // Don't delete the edge from the shadow graph, unless we're completely disconnecting
    // the node.
    DeleteEdgeFrom(fromIndex: number, toIndex: number) {
        var graph = this.graph;
        this.graph.DeleteEdgeFromIndex(fromIndex, toIndex);

        if(graph.NodeAt(fromIndex).Nodes().length === 0) this.regionGraph.DeleteNodeAt(fromIndex);
        if(graph.NodeAt(toIndex).Nodes().length === 0) this.regionGraph.DeleteNodeAt(toIndex);

        return this;
    }

    NodesBoundingCell(cellX: number, cellY: number) {
        var bottomLeft = cellY * this.x + cellX;
        var topLeft = (cellY + 1) * this.x + cellX;

        return [
            bottomLeft,
            bottomLeft + 1,
            topLeft,
            topLeft + 1
        ]
    }

    CellExists(cellX: number, cellY: number) {
        var boundingNodes = this.NodesBoundingCell(cellX, cellY);
        var len = boundingNodes.length;

        for(var i = 0; i < len; i++) {
            if(!this.graph.NodeIsConnected(boundingNodes[i])) {
                return false;
            }
        }

        return true;
    }

    private connectedUp(cellX: number, cellY: number, solution: Node<number>[], regionIndexes: number[]) {
        if(cellY >= this.cellY-1) return false;
        if(regionIndexes[cellX + (cellY+1)*this.cellX]) return false;

        return this.connectedVertical(cellX, cellY, solution, 1);
    }

    private connectedDown(cellX: number, cellY: number, solution: Node<number>[], regionIndexes: number[]) {
        if(cellY <= 0) return false;
        if(regionIndexes[cellX + (cellY-1)*this.cellX]) return false;

        return this.connectedVertical(cellX, cellY, solution, -1);
    }

    private connectedRight(cellX: number, cellY: number, solution: Node<number>[], regionIndexes: number[]) {
        if(cellX >= this.cellX-1) return false;
        if(regionIndexes[(cellX + 1) + cellY * this.cellX]) return false;

        return this.connectedHorizontal(cellX, cellY, solution, 1);
    }

    private connectedLeft(cellX: number, cellY: number, solution: Node<number>[], regionIndexes: number[]) {
        if(cellX <= 0) return false;
        if(regionIndexes[(cellX - 1) + cellY * this.cellX]) return false;

        return this.connectedHorizontal(cellX, cellY, solution, -1);
    }

    private connectedVertical(cellX: number, cellY: number, solution: Node<number>[], direction: number) {
        const nodeY = cellY + (direction === 1 ? 1 : 0);
        const firstIndex = cellX + nodeY * this.x;
        const secondIndex = firstIndex + 1;

        return !Grid.edgeExists(firstIndex, secondIndex, solution);
    }

    private connectedHorizontal(cellX: number, cellY: number, solution: Node<number>[], direction: number) {
        const nodeX = cellX + (direction === 1 ? 1 : 0);
        const firstIndex = nodeX + cellY * this.x;
        const secondIndex = firstIndex + this.y;

        return !Grid.edgeExists(firstIndex, secondIndex, solution);
    }

    private static edgeExists(firstIndex: number, secondIndex: number, solution: Node<number>[]) {
        // No revisiting, so the first time we find the index, we can return the answer immediately.
        // So if there's a solution edge between the cells, return false.
        for(let i = 0; i < solution.length - 1; i++) {
            var node = solution[i];
            var index = node.Index();

            if(firstIndex === index) {
                return solution[i+1].Index() === secondIndex;
            }

            if(secondIndex === index) {
                return solution[i+1].Index() === firstIndex;
            }
        }

        return false;
    }

    DetermineAllRegions(solution : Node<number>[]) {
        let len = this.cellX * this.cellY;
        let regionIndexes = new Array<number>(len);
        let regionNumber = 1;

        for(let i = 0; i < len; i++) {
            if(regionIndexes[i]) continue;

            this.FloodFill(i % this.cellX, Math.floor(i / this.cellX), solution, regionIndexes, regionNumber);
            regionNumber++;
        }

        return regionIndexes;
    }

    IsEdgeNode(index: number) {
        return this.regionGraph.NodeAt(index).Nodes().length < 8;
    }

    FloodFill(cellX: number, cellY: number, solution: Node<number>[], regionCells: number[], regionNumber: number = 1) {
        const stack = new Stack<[number, number]>(this.cellY + 1);

        stack.push([cellX, cellY]);

        while(stack.Size()) {
            let [x, y] = stack.pop();

            while(this.connectedLeft(x, y, solution, regionCells)) x--;

            let spanAbove: boolean;
            let spanBelow: boolean;
            spanAbove = spanBelow = false;

            while(x < this.cellX) {
                regionCells[x + this.cellX * y] = regionNumber;
                const up = this.connectedUp(x, y, solution, regionCells);
                if(!spanAbove && up) {
                    stack.push([x, y + 1]);
                    spanAbove = true;
                }
                else spanBelow = up;

                const down = this.connectedDown(x, y, solution, regionCells);
                if(!spanBelow && down) {
                    stack.push([x, y - 1]);
                    spanBelow = true;
                }
                else spanBelow = down;

                const right = this.connectedRight(x, y, solution, regionCells);
                if(!right) break;

                x++;
            }
        }

        return regionCells;
    }

    CellX() { return this.cellX; }
    CellY() { return this.cellY; }
    X() { return this.x; }
    Y() { return this.y; }

    IterateCells() : NumberPair[] {
        return _.range(this.cellX * this.cellY)
            .map(i => <NumberPair>[i % this.cellX, Math.floor(i / this.cellY)]);
    }
}

export type NumberPair = [number, number];

function getEdges(i: number, x: number, y: number, eightDir: boolean, edges: [number, number][]) {
    const row = Math.floor(i / x);
    const col = i % x;

    const up = row < y-1;
    const right = col < x-1;
    const left = row > 0;

    if(up) {
        edges.push([i, i+x]);
        if(eightDir && left) edges.push([i, i+x - 1]);
        if(eightDir && right) edges.push([i, i+x + 1])
    }
    if(right) edges.push([i, i+1]);

    return edges;
}

export function createGridGraph(x: number, y: number, eightDir: boolean = false) {
    const n = x * y;
    const indices = _.range(n);

    const edges : [number, number][] = [];
    _.each(indices, i => getEdges(i, x, y, eightDir, edges));

    return new Graph(indices, edges);
}