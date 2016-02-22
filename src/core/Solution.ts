///<reference path="Graph.ts"/>
///<reference path="Util.ts"/>
///<reference path="Grid.ts"/>
///<reference path="GridSolver.ts"/>
import {Node} from "./Graph";
import {clonePush} from "./Util";
import {Grid} from "./Grid";
import {GridSolver} from "./GridSolver";

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
    private regions: number[];
    private groupedRegions: number[][];
    private openRegion: number;

    constructor(solution: Node<number>[], regions: number[], groupedRegions: number[][]) {
        super(solution);
        this.regions = regions;
        this.groupedRegions = groupedRegions;
    }

    public CloneWith(newEl: Node<number>) {
        return new GraphSolution(clonePush(this.solution, newEl), this.regions, this.groupedRegions);
    }

    // The open region is the one containing the last element of the solution.
    // When that doesn't yet exist, all regions are open, characterized by -1.
    // If we're at an exit, all regions are closed, characterized by -2.
    public SetOpenRegion(grid: Grid, solver: GridSolver) {
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
        if(this.regions.length) {
            // If we're on an edge node, but the previous was also an edge, we don't
            // can't have defined a new region.
            const lastIsEdge = grid.IsEdgeNode(this.Last());
            const prevIsEdge = grid.IsEdgeNode(this.Previous());

            if(!lastIsEdge || prevIsEdge) {
                this.SetOpenRegion(grid, solver);
                return this;
            }
        }

        this.regions = grid.DetermineAllRegions(this.solution);
        this.groupedRegions = GraphSolution.GroupRegions(this.regions);
        this.SetOpenRegion(grid, solver);
    }

    public OpenRegion() { return this.openRegion; }

    public static GroupRegions(regions: number[]) {
        const grouped: number[][] = [];

        for(let i = 0; i < regions.length; i++) {
            var region = regions[i];
            if(region === void 0) continue;
            if(!grouped[region]) grouped[region] = [];

            grouped[region].push(i);
        }

        return grouped;
    }

    public Regions() { return this.regions; }
    public GroupedRegions() { return this.groupedRegions; }
}