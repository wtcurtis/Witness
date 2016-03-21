///<reference path="Rule.ts"/>
///<reference path="../GridSolver.ts"/>
///<reference path="../Solution.ts"/>
import {Rule} from "./Rule";
import {GraphSolution} from "../Solution";
import {GridSolver} from "../GridSolver";
import {cloneArray} from "../Util";
import {Pair} from "../Util";
import {clonePairArray} from "../Util";
import {Grid} from "../Grid";

export class TetrisRule implements Rule {
    private blocks: TetrisBlock[];
    private solver: GridSolver;
    private grid: Grid;

    constructor(grid: Grid) {
        this.blocks = [];
        this.grid = grid;
    }

    Reject(solution: GraphSolution): boolean {
        const groupedBlocks = this.groupByRegion(solution);
        if(this.rejectByRegionSize(solution, groupedBlocks)) return true;

        return false;
    }

    rejectByRegionSize(solution: GraphSolution, groupedBlocks: TetrisBlock[][]) {
        const groupedRegions = solution.GroupedRegions();
        const closedRegions = solution.ClosedRegions();

        const invalidRegionSizes = _.some(closedRegions, r => {
            const cellSum =_.sumBy(groupedBlocks[r], b => b.ActiveRotation().length);
            return cellSum && cellSum !== groupedRegions[r].length;
        });

        if(invalidRegionSizes) return true;

        return false;
    }

    SetSolver(solver: GridSolver): void {
        this.solver = solver;
    }

    AddLBlock(location: Pair<number>, rightRotations: number = 0, rotatable: boolean = false) {
        const cells: Pair<number>[] = [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1]
        ];

        const rotated = TetrisBlock.rotateRight(cells, rightRotations);
        const block= new TetrisBlock(
            [rotated],
            [location[0], location[1]],
            rotatable
        );

        this.blocks.push(block);
        return this;
    }

    AddSquareBlock(location: Pair<number>) {
        const cells: Pair<number>[] = [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
        ];

        const block= new TetrisBlock(
            [cells],
            [location[0], location[1]],
            true
        );

        this.blocks.push(block);
        return this;
    }

    private groupByRegion(solution: GraphSolution) {
        var regionIndexes = solution.Regions();

        var grouped: TetrisBlock[][] = [];

        for(let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            const blockRegion = regionIndexes[block.CellIndex(this.grid)];
            if(!blockRegion) continue;

            if(!grouped[blockRegion]) grouped[blockRegion] = [];
            grouped[blockRegion].push(this.blocks[i]);
        }

        return grouped;
    }

    Blocks() { return this.blocks; }
}

type RotationMatrix = Pair<Pair<number>>;

export class TetrisBlock {
    cells: Pair<number>[][];
    cellLocation: Pair<number>;
    rotatable: boolean;

    constructor(cells: Pair<number>[][], location: Pair<number>, rotatable: boolean) {
        this.cells = cells;
        this.cellLocation = location;
        this.rotatable = rotatable;

        if(cells.length === 1) {
            cells[0] = TetrisBlock.normalizeCells(cells[0]);

            if(rotatable) {
                let last = cells[0];
                for(let i = 0; i < 3; i++) {
                    let rotated = TetrisBlock.rotate(last, TetrisBlock.rotateRightMatrix, 1);
                    this.cells.push(rotated);
                }
            }
        }
    }

    clone() {
        return new TetrisBlock(
            this.cells.map(clonePairArray),
            [this.cellLocation[0], this.cellLocation[1]],
            this.rotatable
        );
    }

    static normalizeCells(cells: Pair<number>[]) {
        const sorted = _.sortBy(cells, [
            (c: Pair<number>) => -c[0],
            (c: Pair<number>) => -c[1]
        ]);

        for(let i = 1; i < sorted.length; i++) {
            sorted[i][0] = sorted[0][0] - sorted[i][0];
            sorted[i][1] = sorted[0][1] - sorted[i][1];
        }

        sorted[0][0] = 0;
        sorted[0][1] = 0;

        return sorted;
    }

    static rotateRight(cells: Pair<number>[], count: number = 1) {
        return TetrisBlock.rotate(cells, TetrisBlock.rotateRightMatrix, count);
    }

    static rotate(cells: Pair<number>[], matrix: RotationMatrix, count: number = 1, clone = true)
        : Pair<number>[]
    {
        const newCells = clone
            ? clonePairArray(cells)
            : cells;

        for(let rIndex = 0; rIndex < count; rIndex++) {
            for(let i = 0; i < newCells.length; i++) {
                const cell = newCells[i];
                const newCell: Pair<number> = [
                    matrix[0][0] * cell[0] + matrix[1][0] * cell[1],
                    matrix[0][1] * cell[0] + matrix[1][1] * cell[1]
                ];

                newCells[i] = newCell;
            }
        }

        return TetrisBlock.normalizeCells(newCells);
    }

    ActiveRotation() {
        return this.cells[0];
    }

    CellIndex(grid: Grid) {
        return this.cellLocation[0] + this.cellLocation[1] * grid.CellY();
    }

    private static rotateRightMatrix: RotationMatrix = [[0, 1], [-1, 0]];
}