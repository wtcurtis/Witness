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

type RegionGroup = TetrisBlock[][];

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

    rejectByRegionSize(solution: GraphSolution, groupedBlocks: RegionGroup) {
        const groupedRegions = solution.GroupedRegions();
        const closedRegions = solution.ClosedRegions();

        const invalidRegionSizes = _.some(closedRegions, r => {
            if(groupedBlocks[r] === undefined) return false;

            const cellSum =_.sumBy(groupedBlocks[r], b => b.ActiveRotation().length);
            return cellSum && cellSum !== groupedRegions[r].length;
        });

        return invalidRegionSizes;
    }

    AllValidPlacements(solution: GraphSolution, groupedBlocks: RegionGroup) {
        const groupedRegions = solution.GroupedRegions();
        const allRegions = solution.Regions();

        const allValidPlacements: [TetrisBlock, [number, Pair<number>[][]][]][] = [];

        for(let region = 0; region < groupedBlocks.length; region++) {
            const group = groupedBlocks[region];
            if(group === undefined) continue;

            for(let j = 0; j < group.length; j++) {
                const block = group[j];
                const byPlacement = this.getRotationsByPlacement(block, region, groupedRegions, allRegions);

                if(byPlacement.length === 0) return [];

                allValidPlacements.push([block, byPlacement]);
            }
        }

        return allValidPlacements;
    }

    private getRotationsByPlacement(block: TetrisBlock, regionNumber: number, groupedRegions: number[][], regions: number[]) {
        const region = groupedRegions[regionNumber];

        const allRotations: [number, Pair<number>[][]][] = [];
        for(let i = 0; i < region.length; i++) {
            const cIndex = region[i];
            const validRotations = this.ValidRotationsAt(block, cIndex, regionNumber, regions);
            if(validRotations.length) allRotations.push([cIndex, validRotations]);
        }

        return allRotations;
    }

    SetSolver(solver: GridSolver): void {
        this.solver = solver;
    }

    AddBlock(cells: Pair<number>[], location: Pair<number>, rotatable: boolean = false, rightRotations: number = 0) {
        const rotated = TetrisBlock.rotateRight(cells, rightRotations);
        const block= new TetrisBlock(
            [rotated],
            [location[0], location[1]],
            rotatable
        );

        this.blocks.push(block);
        return this;
    }

    AddLBlockL(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        return this.AddBlock(TetrisBlock.LBlockCells(), location, rotatable, rightRotations);
    }

    AddLBlockR(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        const cells: Pair<number>[] = TetrisBlock.mirrorHorz(TetrisBlock.LBlockCells());

        return this.AddBlock(cells, location, rotatable, rightRotations);
    }

    AddZBlockL(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        return this.AddBlock(TetrisBlock.ZBlockCells(), location, rotatable, rightRotations);
    }

    AddZBlockR(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        const cells: Pair<number>[] = TetrisBlock.mirrorHorz(TetrisBlock.ZBlockCells());

        return this.AddBlock(cells, location, rotatable, rightRotations);
    }

    AddSquareBlock(location: Pair<number>) {
        return this.AddBlock(TetrisBlock.SquareBlockCells(), location);
    }

    AddLineBlock(location: Pair<number>, rotatable: boolean = false, rightRotations: number = 0) {
        return this.AddBlock(TetrisBlock.LineBlockCells(), location, rotatable, rightRotations);
    }

    private groupByRegion(solution: GraphSolution) {
        var regionIndexes = solution.Regions();

        var grouped: RegionGroup = [];

        for(let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            const blockRegion = regionIndexes[block.CellIndex(this.grid.CellX())];
            if(!blockRegion) continue;

            if(!grouped[blockRegion]) grouped[blockRegion] = [];
            grouped[blockRegion].push(this.blocks[i]);
        }

        return grouped;
    }

    ValidRotationsAt(block: TetrisBlock, positionIndex: number, cellRegion: number, regions: number[]) {
        const cellX = this.grid.CellX();

        return block.cells.filter(r => {
            return _.every(r, c => {
                const cellIndex = positionIndex + (c[0] + c[1] * cellX);
                return regions[cellIndex] === cellRegion;
            });
        });
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
                var rotated: Pair<number>[];
                let last = cells[0];
                for(let i = 0; i < 3; i++) {
                    rotated = TetrisBlock.rotate(last, TetrisBlock.rotateRightMatrix, 1);

                    // Don't keep symmetric rotations.
                    if(_.some(this.cells, c => this.normalizedCellListEqual(rotated, c))) break;

                    this.cells.push(rotated);
                    last = rotated;
                }
            }
        }
    }

    normalizedCellListEqual(first: Pair<number>[], second: Pair<number>[]) {
        if(first.length !== second.length) return false;
        if(!first.length) return false;

        for(let i = 0; i < first.length; i++) {
            if(first[i][0] !== second[i][0]) return false;
            if(first[i][1] !== second[i][1]) return false;
        }

        return true;
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

    static mirrorHorz(cells: Pair<number>[]): Pair<number>[] {
        const maxX: number = _.maxBy(cells, c => c[0])[0];

        return TetrisBlock.normalizeCells(cells.map(c => <Pair<number>>[maxX - c[0], c[1]]));
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

    CellIndex(cellX: number) {
        return this.cellLocation[0] + this.cellLocation[1] * cellX;
    }

    private static rotateRightMatrix: RotationMatrix = [[0, 1], [-1, 0]];

    // These are all static functions, since arrays are passed by reference friggin
    // everywhere. New instance each call.
    static LBlockCells(): Pair<number>[] {
        return [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1]
        ]
    }

    static SquareBlockCells(): Pair<number>[] {
        return [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
        ];
    }

    static ZBlockCells(): Pair<number>[] {
        return [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1]
        ];
    }

    static LineBlockCells(): Pair<number>[] {
        return [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3]
        ];
    }
}