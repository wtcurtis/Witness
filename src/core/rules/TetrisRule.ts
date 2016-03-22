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
import {last} from "../Util";

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
        if(solution.AllRegionsOpen()) return false;

        const groupedBlocks = this.groupByRegion(solution);
        if(this.rejectByRegionSize(solution, groupedBlocks)) return true;

        const placements = this.AllValidPlacements(solution, groupedBlocks);
        if(!placements.length) return true;

        return this.rejectByPlacement(solution, placements);
    }

    private rejectByPlacement(solution: GraphSolution, placements: [number, [TetrisBlock, PositionTuple[]][]][]) {
        const regions = solution.Regions();
        const cellX = this.grid.CellX();
        for(let i = 0; i < placements.length; i++) {
            const [region, gPlacements] = placements[i];

            for(
                let currentPlacement = gPlacements.map((p):any => [0, 0]);
                currentPlacement !== null;
                currentPlacement = this.nextPlacementChoice(gPlacements, currentPlacement)
            ) {
                if(this.placementIsValid(currentPlacement, gPlacements, region, regions, cellX)) {
                    return false;
                }
            }
        }

        return true;
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

        const allValidPlacements: [number, [TetrisBlock, PositionTuple[]][]][] = [];

        for(let region = 0; region < groupedBlocks.length; region++) {
            const group = groupedBlocks[region];
            if(group === undefined) continue;

            allValidPlacements.push([region, []]);//[region] = [];

            for(let j = 0; j < group.length; j++) {
                const block = group[j];
                block.regionNumber = region;
                const byPlacement = this.getRotationsByPlacement(block, region, groupedRegions, allRegions);

                if(byPlacement.length === 0) return [];

                last(allValidPlacements)[1].push([block, byPlacement]);
            }
        }

        return allValidPlacements;
    }

    private placementIsValid(
        placements: Pair<number>[],
        groupPlacements: [TetrisBlock, PositionTuple[]][],
        regionNumber: number,
        regions: number[],
        cellX: number)
    {
        const distinct: boolean[] = [];
        for(let i = 0; i < placements.length; i++) {
            const [posIndex, rotIndex] = placements[i];
            const posReference = groupPlacements[i][1][posIndex];
            const rotation = posReference[1][rotIndex];
            const position = posReference[0];

            for(let j = 0; j < rotation.length; j++) {
                const rotPosition = rotation[j];
                const cIndex = position + rotPosition[0] + rotPosition[1] * cellX;

                if(regions[cIndex] !== regionNumber) return false;
                if(distinct[cIndex]) return false;

                distinct[cIndex] = true;
            }
        }

        return true;
    }

    private nextPlacementChoice(placements: [TetrisBlock, PositionTuple[]][], currentPlacement: Pair<number>[] = null) {
        if(!currentPlacement) {
            currentPlacement = placements.map(p => <Pair<number>>[0, 0]);
        }

        for(var i = currentPlacement.length - 1; i >= 0; i--) {
            let updated = false;
            const [position, rotation] = currentPlacement[i];
            const posReference = placements[i][1][position];
            if(rotation < posReference[1].length - 1) {
                currentPlacement[i][1]++;
                updated = true;
            } else if(position < placements[i][1].length - 1) {
                currentPlacement[i][0]++;
                currentPlacement[i][1] = 0;
                updated = true;
            }

            if(updated) {
                for(let j = i+1; j < currentPlacement.length; j++) {
                    currentPlacement[j] = [0, 0];
                }

                return currentPlacement;
            }
        }

        return null;
    }

    private getRotationsByPlacement(block: TetrisBlock, regionNumber: number, groupedRegions: number[][], regions: number[]) {
        const region = groupedRegions[regionNumber];

        const allRotations: PositionTuple[] = [];
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

    AddBlock(cells: PairArray<number>, location: Pair<number>, rotatable: boolean = false, rightRotations: number = 0) {
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
        const cells: PairArray<number> = TetrisBlock.mirrorHorz(TetrisBlock.LBlockCells());

        return this.AddBlock(cells, location, rotatable, rightRotations);
    }

    AddZBlockL(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        return this.AddBlock(TetrisBlock.ZBlockCells(), location, rotatable, rightRotations);
    }

    AddZBlockR(location: Pair<number>,  rotatable: boolean = false, rightRotations: number = 0) {
        const cells: PairArray<number> = TetrisBlock.mirrorHorz(TetrisBlock.ZBlockCells());

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
type PairArray<T> = Pair<T>[];
type PositionTuple = [number, PairArray<number>[]];

export class TetrisBlock {
    cells: PairArray<number>[];
    cellLocation: Pair<number>;
    rotatable: boolean;
    regionNumber: number;

    constructor(cells: PairArray<number>[], location: Pair<number>, rotatable: boolean) {
        this.cells = cells;
        this.cellLocation = location;
        this.rotatable = rotatable;

        if(cells.length === 1) {
            cells[0] = TetrisBlock.normalizeCells(cells[0]);

            if(rotatable) {
                var rotated: PairArray<number>;
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

    normalizedCellListEqual(first: PairArray<number>, second: PairArray<number>) {
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

    static normalizeCells(cells: PairArray<number>) {
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

    static mirrorHorz(cells: PairArray<number>): PairArray<number> {
        const maxX: number = _.maxBy(cells, c => c[0])[0];

        return TetrisBlock.normalizeCells(cells.map(c => <Pair<number>>[maxX - c[0], c[1]]));
    }

    static rotateRight(cells: PairArray<number>, count: number = 1) {
        return TetrisBlock.rotate(cells, TetrisBlock.rotateRightMatrix, count);
    }

    static rotate(cells: PairArray<number>, matrix: RotationMatrix, count: number = 1, clone = true)
        : PairArray<number>
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
    static LBlockCells(): PairArray<number> {
        return [
            [0, 0],
            [1, 0],
            [2, 0],
            [0, 1]
        ]
    }

    static SquareBlockCells(): PairArray<number> {
        return [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1]
        ];
    }

    static ZBlockCells(): PairArray<number> {
        return [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1]
        ];
    }

    static LineBlockCells(): PairArray<number> {
        return [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3]
        ];
    }
}