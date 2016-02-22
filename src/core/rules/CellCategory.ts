///<reference path="../Grid.ts"/>
///<reference path="../Solution.ts"/>
///<reference path="../GridSolver.ts"/>
import {Grid} from "../Grid";
import {GraphSolution} from "../Solution";
import {GridSolver} from "../GridSolver";

export class CellCategory {
    protected grid: Grid;
    protected categories: number[];
    protected solver: GridSolver;

    constructor(grid: Grid) {
        this.grid = grid;
        this.categories = [];
    }

    public SetSolver(solver: GridSolver) {
        this.solver = solver;
    }

    public AddCategoryAt(category: number, cellX: number, cellY: number) {
        this.categories[this.grid.CellIndex(cellX, cellY)] = category;
        return this;
    }

    /**
     * Reject if there exists any closed region with more than one category present.
     * @param solution
     * @returns {boolean}
     * @constructor
     */
    public Reject(solution: GraphSolution) {
        const regions = solution.GroupedRegions();
        const openRegion = solution.OpenRegion();

        // If we don't have a known open region, just get out.
        if(openRegion === -1) return false;

        for(let region = 0; region < regions.length; region++) {
            if(region === openRegion) continue;

            const indexes = regions[region];
            if(indexes === void 0) continue;

            let lastCategory: number = -1;
            for(let j = 0; j < indexes.length; j++) {
                const cellIndex = indexes[j];
                const cat = this.categories[cellIndex];

                if(cat === void 0) continue;
                if(lastCategory === -1) lastCategory = cat;

                if(cat !== lastCategory) return true;
            }
        }

        return false;
    }
}