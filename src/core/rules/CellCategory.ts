///<reference path="../Grid.ts"/>
///<reference path="../Solution.ts"/>
///<reference path="../GridSolver.ts"/>
///<reference path="Rule.ts"/>
import {Grid} from "../Grid";
import {GraphSolution} from "../Solution";
import {GridSolver} from "../GridSolver";
import {Rule} from "./Rule";

/**
 * This is the square color cell sections (where each region must contain at most one color)
 */
export class CellCategory implements Rule {
    protected grid: Grid;
    protected categories: number[];
    protected pairCategories: number[];
    protected solver: GridSolver;

    constructor(grid: Grid) {
        this.grid = grid;
        this.categories = [];
        this.pairCategories = [];
    }

    public SetSolver(solver: GridSolver) {
        this.solver = solver;
        return this;
    }

    public AddCategoryAt(category: number, cellX: number, cellY: number) {
        this.categories[this.grid.CellIndex(cellX, cellY)] = category;
        return this;
    }

    public AddPairCategoryAt(category: number, cellX: number, cellY: number) {
        this.pairCategories[this.grid.CellIndex(cellX, cellY)] = category;
        return this;
    }

    /**
     * Reject if there exists any closed region with more than one category present.
     * @param solution
     * @returns {boolean}
     * @constructor
     */
    public rejectByCategory(solution: GraphSolution) {
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

                if(cat !== lastCategory) {
                    //console.log('rejecting, category', solution);
                    return true;
                }
            }
        }

        return false;
    }

    public rejectByPair(solution: GraphSolution) {
        const regions = solution.GroupedRegions();
        const openRegion = solution.OpenRegion();

        // If we don't have a known open region, just get out.
        if(openRegion === -1) return false;

        for(let region = 0; region < regions.length; region++) {
            if(region === openRegion) continue;

            const indexes = regions[region];
            if(indexes === void 0) continue;

            const categoryCounts: number[] = [];
            //let lastCategory: number = -1;
            for(let j = 0; j < indexes.length; j++) {
                const cellIndex = indexes[j];
                const cat = this.pairCategories[cellIndex];

                if(cat === void 0) continue;
                if(categoryCounts[cat] === void 0) categoryCounts[cat] = 0;

                categoryCounts[cat] += 1;

                if(categoryCounts[cat] > 2) return true;
            }

            const anySingles = _.some(categoryCounts, (count) => {
                return count === 1;
            });

            if(anySingles) return true;
        }

        return false;
    }

    public Reject(solution: GraphSolution) {
        if(this.rejectByCategory(solution)) return true;
        return this.rejectByPair(solution);
    }

    public Categories() { return this.categories; }
    public PairCategories() { return this.pairCategories; }
}