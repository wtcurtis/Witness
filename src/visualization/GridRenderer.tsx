///<reference path="../core/Grid.ts"/>
///<reference path="../core/Graph.ts"/>
///<reference path="../../typings/main.d.ts"/>
///<reference path="../core/GridSolver.ts"/>
///<reference path="../core/Solution.ts"/>
///<reference path="../core/rules/Rule.ts"/>
///<reference path="../core/rules/RequiredVisit.ts"/>
import {Grid} from "../core/Grid";
import {Node} from "../core/Graph";
import React = require('react');
import {last} from "../core/Util";
import {GridSolver} from "../core/GridSolver";
import {GraphSolution} from "../core/Solution";
import {Rule} from "../core/rules/Rule";
import {CellCategory} from "../core/rules/CellCategory";
import {RequiredVisit} from "../core/rules/RequiredVisit";
import {Rules} from "./Rules";
import {Solution, SolutionProps} from "./Solution";
import {Pair} from "../core/Util";

export interface GridRendererProps {
    grid: Grid,
    solution: GraphSolution,
    cellWidth: number,
    cellMargin: number,
    solver: GridSolver
}

export class HtmlGridRenderer extends React.Component<GridRendererProps, {}> {
    public lastRejections: GraphSolution[];

    render() {
        const grid = this.props.grid;
        const solution = this.props.solution.RawSolution();
        const regions = grid.DetermineAllRegions(solution);

        var children = _.reverse(_.chunk(grid.IterateCells(), grid.CellX()))
            .map(r => {
                var cells = r.map((pair: Pair<number>) => { return {
                    x: pair[0],
                    y: pair[1],
                    mainProps: this.props,
                    region: regions[pair[1] * grid.CellX() + pair[0]]
                }});

                return <GridRow cells={cells} mainProps={this.props} />;
            });

        if(solution) {
            children.push(<Solution mainProps={this.props} />);
        }

        children.push(<Rules mainProps={this.props} />);


        return <div tabIndex={0} className="Grid" onKeyDown={this.keyDown.bind(this)}>
            {children}
        </div>;
    }

    moveSolution(x: number, y: number) {
        const solution = this.props.solution.RawSolution();
        const lastEl = last(solution);
        const grid = this.props.grid;

        var nextIndex = lastEl.Index() + (x + y*grid.X());
        var nextNode = grid.Graph().NodeAt(nextIndex);
        if(!lastEl.ConnectedTo(nextIndex)) return;

        const previousIndex = solution.indexOf(nextNode);
        if(solution.length > 1 && previousIndex === solution.length - 2) {
            solution.splice(solution.length-1, 1);
        }

        else if(previousIndex !== -1) return;
        else solution.push(nextNode);

        const gSol = new GraphSolution(solution, [], []);
        const isSolution = this.props.solver.IsSolution(gSol);
        if(isSolution) console.log('solved');
        else if(this.props.solver.IsExit(gSol.Last())) console.log('bad solution');

        this.forceUpdate();
    }

    renderFailedSolutions(timeout: number = 1000) {
        if(!this.lastRejections) return;

        let i = 0;
        let interval = setInterval(() => {
            if(!this.lastRejections[i]) {
                clearInterval(interval);
                return;
            }

            this.renderSolution(this.lastRejections[i++]);
        }, timeout);
    }

    renderSolution(solution: GraphSolution) {
        this.props.solution.SetRawSolution(solution);
        this.forceUpdate();
    }

    Solve(toFind: number = 100) {
        const solver = this.props.solver;
        this.props.solution.SetRegions(this.props.grid, this.props.solver, true);
        const [solutions, rejections] = solver.Solve(toFind, this.props.solution);
        this.lastRejections = rejections;
        const graph = this.props.grid.Graph();
        let i = 0;

        const interval = setInterval(() => {
            const solution = solutions[i++];
            if(!solution) {
                clearInterval(interval);
                return;
            }

            var rawSolution = this.props.solution.RawSolution();
            rawSolution.splice(0);
            for(let i = 0; i < solution.length; i++) {
                rawSolution[i] = graph.NodeAt(solution[i]);
            }

            this.forceUpdate();
        }, 100);
    }

    keyDown(e: React.KeyboardEvent) {
        if(e.keyCode === 37) this.moveSolution(-1, 0);
        if(e.keyCode === 39) this.moveSolution(1, 0);
        if(e.keyCode === 38) this.moveSolution(0, 1);
        if(e.keyCode === 40) this.moveSolution(0, -1);
        if(e.keyCode === 32) this.Solve(1);
    }
}

interface RowProps {
    mainProps: GridRendererProps,
    cells: CellProps[]
}

interface CellProps {
    mainProps: GridRendererProps,
    x: number,
    y: number,
    region: number
}

class GridRow extends React.Component<RowProps, {}> {
    render() {
        var children = this.props.cells.map(c =><GridCell {...c} />);
        return <div className="gridRow">
            {children}
        </div>
    }
}

class GridCell extends React.Component<CellProps, {}> {
    render() {
        const main = this.props.mainProps;
        const dead = !main.grid.CellExists(this.props.x, this.props.y);

        const colors = [
            '#ffffd9',
            '#edf8b1',
            '#c7e9b4',
            '#7fcdbb',
            '#41b6c4',
            '#1d91c0',
            '#225ea8',
            '#253494',
            '#081d58',
        ];

        const style = {
            width: main.cellWidth,
            height: main.cellWidth,
            margin: main.cellMargin,
            backgroundColor: dead ? 'inherit' : colors[this.props.region % colors.length]
        };

        return <div className="gridCell" style={style} />;
    }
}

export function cellToIndex(cellX: number, cellY: number, grid: Grid) {
    return cellX + cellY * grid.CellY();
}

export function indexToCell(cellIndex: number, grid: Grid): [number, number] {
    return [
        cellIndex % grid.CellX(),
        Math.floor(cellIndex / grid.CellX())
    ];
}

export function nodeToIndex(nodeX: number, nodeY: number, grid: Grid) {
    return nodeX + nodeY * grid.X();
}

export function indexToNode(nodeIndex: number, grid: Grid): [number, number] {
    return [
        nodeIndex % grid.X(),
        Math.floor(nodeIndex / grid.X())
    ];
}

export function nodeCenter(nodeX: number, nodeY: number, props: GridRendererProps): [number, number] {
    const margin = props.cellMargin;
    const width = props.cellWidth;

    const left = (margin * 2 + width) * nodeX + margin;
    const top = (margin * 2 + width) * (props.grid.Y() - nodeY - 1) + margin;

    return [left, top];
}

export function nodeCenterIndex(nodeIndex: number, props: GridRendererProps) {
    const [x, y] = indexToNode(nodeIndex, props.grid);
    return nodeCenter(x, y, props);
}

export function cellCenter(cellX: number, cellY: number, props: GridRendererProps): [number, number] {
    const margin = props.cellMargin;
    const width = props.cellWidth;

    const left = (margin * 2 + width) * cellX + width / 2;
    const top = (margin * 2 + width) * (props.grid.CellY() - 1 - cellY) + width / 2;

    return [left, top];
}

export function cellCenterIndex(cellIndex: number, props: GridRendererProps) {
    const [x, y] = indexToCell(cellIndex, props.grid);
    return cellCenter(x, y, props);
}
