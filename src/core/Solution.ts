///<reference path="Graph.ts"/>
///<reference path="Util.ts"/>
///<reference path="Grid.ts"/>
///<reference path="GridSolver.ts"/>
import {Node} from "./Graph";
import {clonePush} from "./Util";
import {Grid} from "./Grid";
import {GridSolver} from "./GridSolver";
import {cloneArray} from "./Util";

export class Solution<T> {
    protected solution: T[];

    constructor(solution: T[]) {
        this.solution = solution;
    }

    public Last() : T {
        return this.solution[this.solution.length - 1];
    }

    public Previous() : T {
        return this.solution[this.solution.length - 2];
    }

    public CloneWith(newEl: T) {
        return new Solution(clonePush(this.solution, newEl));
    }

    public RawSolution() {
        return this.solution;
    }
}

export class GraphSolution extends Solution<Node<number>> {
    /** Array of region numbers, index is cell index */
    private regions: number[];

    /** List of valid region numbers (deleted nodes can lead to empty regions) */
    private allRegions: number[];
    /**
     * Array of regions numbers. Index is region number, sub-array contains cell
     * indexes within that region
     */
    private groupedRegions: number[][];

    /** Region number of the current open region */
    private openRegion: number;

    /** Closed region numbers */
    private closedRegions: number[];

    /** Region numbers that currently contain an exit. */
    private exitRegions: number[];

    constructor(solution: Node<number>[], regions: number[] = [], groupedRegions: number[][] = []) {
        super(solution);
        this.regions = regions;
        this.groupedRegions = groupedRegions;
    }

    public setAllRegions(allRegions: number[]) {
        this.allRegions = allRegions;
        return this;
    }

    public setOpenRegion(region: number) {
        this.openRegion = region;
        return this;
    }

    public setClosedRegions(regions: number[]) {
        this.closedRegions = regions;
        return this;
    }

    public CloneWith(newEl: Node<number>) {
        return new GraphSolution(clonePush(this.solution, newEl), this.regions, this.groupedRegions)
            .setAllRegions(this.allRegions)
            .setOpenRegion(this.openRegion)
            .setClosedRegions(this.closedRegions);
    }

    private SetClosedRegions() {
        if(this.openRegion === -1) {
            this.closedRegions = [];
            return;
        }

        if(this.openRegion === -2) {
            this.closedRegions = cloneArray(this.allRegions);
            return;
        }

        const closed: number[] = [];

        for(let i = 0; i < this.allRegions.length; i++) {
            const region = this.allRegions[i];
            if(this.openRegion !== region) closed.push(region)
        }

        this.closedRegions = closed;
    }

    // The open region is the one containing the last element of the solution.
    // When that doesn't yet exist, all regions are open, characterized by -1.
    // If we're at an exit, all regions are closed, characterized by -2.
    private SetOpenRegion(grid: Grid, solver: GridSolver) {
        const regions = this.regions;
        const last = this.Last();

        if(!last) {
            this.openRegion = -1;
            return;
        }

        if(solver.IsExit(last)) {
            this.openRegion = -2;
            return;
        }

        const bounding = grid.CellsBoundingNode(last);
        let lastRegion = -1;
        for(var i = 0; i < bounding.length; i++) {
            let cellIndex = bounding[i];
            if(lastRegion === -1) {
                lastRegion = regions[cellIndex];
                continue;
            }

            if(lastRegion !== regions[cellIndex]) {
                this.openRegion = -1;
                return;
            }
        }

        this.openRegion = lastRegion;
    }

    public SetRegions(grid: Grid, solver: GridSolver) {
        //if(true || this.regions.length) {
        //    // If we're on an edge node, but the previous was also an edge, we
        //    // can't have defined a new region.
        //    const lastIsEdge = grid.IsEdgeNode(this.Last());
        //    const prevIsEdge = grid.IsEdgeNode(this.Previous());
        //
        //    if(!lastIsEdge || prevIsEdge) {
        //        this.SetOpenRegion(grid, solver);
        //        return this;
        //    }
        //}

        const lastIsEdge = grid.IsEdgeNode(this.Last());
        const prevIsEdge = grid.IsEdgeNode(this.Previous());

        if(!this.regions.length || (lastIsEdge && !prevIsEdge) || (this.openRegion < 0)) {
            this.regions = grid.DetermineAllRegions(this.solution);
        } else {
            let blah = 1;

        }

        this.GroupRegions(this.regions);
        this.SetOpenRegion(grid, solver);
        this.SetClosedRegions();
    }

    public NodeIndexOnSolution(node: number) {
        for(let i = 0; i < this.solution.length; i++) {
            if(this.solution[i].Index() === node) return true;
        }

        return false;
    }

    public NodeOnSolution(node: Node<number>) {
        var nIndex = node.Index();

        return this.NodeIndexOnSolution(nIndex);
    }

    public EdgeOnSolution(from: Node<number>, to: Node<number>) {
        var fIndex = from.Index();
        var tIndex = to.Index();

        return this.EdgeIndexOnSolution(fIndex, tIndex);
    }

    public EdgeIndexOnSolution(fIndex: number, tIndex: number) {
        for(let i = 0; i < this.solution.length - 1; i++) {
            const solIndex = this.solution[i].Index();

            if(fIndex === solIndex && this.solution[i+1].Index() === tIndex) return true;
            if(tIndex === solIndex && this.solution[i+1].Index() === fIndex) return true;
        }

        return false;
    }

    public NodeIndexInClosedRegion(node: number, grid: Grid) {
        // If the node is in a closed region, the set of bounding cells will always be in the same region.
        return this.AllCellsInClosedRegion(grid.CellsBoundingNodeIndex(node));
    }

    public NodeInClosedRegion(node: Node<number>, grid: Grid) {
        // If the node is in a closed region, the set of bounding cells will always be in the same region.
        return this.AllCellsInClosedRegion(grid.CellsBoundingNode(node));
    }

    public EdgeIndexInClosedRegion(from: number, to: number, grid: Grid) {
        // If the edge is in a closed region, the set of bounding cells will always be in the same region.
        return this.AllCellsInClosedRegion(grid.CellsBoundingEdgeIndex(from, to));
    }

    public EdgeInClosedRegion(from: Node<number>, to: Node<number>, grid: Grid) {
        // If the edge is in a closed region, the set of bounding cells will always be in the same region.
        return this.AllCellsInClosedRegion(grid.CellsBoundingEdge(from, to));
    }

    public AllCellsInClosedRegion(boundingCells: number[]) {
        let lastRegion = 0;
        for(let i = 0; i < boundingCells.length; i++) {
            let region = this.regions[boundingCells[i]];

            if(!lastRegion) {
                lastRegion = region;
                continue;
            }

            if(region !== lastRegion) return false;
        }

        return this.IsClosedRegion(lastRegion);
    }

    public IsClosedRegion(regionNumber: number) {
        if(this.openRegion === -1) return false;
        if(this.openRegion === -2) return true;

        return this.openRegion !== regionNumber;
    }

    public OpenRegion() { return this.openRegion; }

    public GroupRegions(regions: number[]) {
        const grouped: number[][] = [];
        const all: number[] = [];

        for(let i = 0; i < regions.length; i++) {
            var region = regions[i];
            if(region === void 0) continue;
            if(!grouped[region]) {
                grouped[region] = [];
                all.push(region);
            }

            grouped[region].push(i);
        }

        this.groupedRegions = grouped;
        this.allRegions = all;
    }

    public Regions() { return this.regions; }
    public GroupedRegions() { return this.groupedRegions; }

    public SetRawSolution(solution: GraphSolution) {
        this.solution = solution.RawSolution();
        return this;
    }
}