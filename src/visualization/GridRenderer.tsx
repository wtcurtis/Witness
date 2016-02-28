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

        var children = _.chunk(grid.IterateCells(), grid.CellX())
            .map(r => {
                var cells = r.map(pair => { return {
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
        if(e.keyCode === 38) this.moveSolution(0, -1);
        if(e.keyCode === 40) this.moveSolution(0, 1);
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

interface SolutionProps {
    mainProps: GridRendererProps
}

interface SolutionSegmentProps {
    mainProps: GridRendererProps,
    fromIndex: number,
    toIndex: number
}

class Solution extends React.Component<SolutionProps, {}> {
    render() {
        const indexPairs = this.getNodePairs();

        return <div className="solution">
            {indexPairs.map((p: [number, number]) =>
                <SolutionSegment mainProps={this.props.mainProps} fromIndex={p[0]} toIndex={p[1]} />
            )}
        </div>;
    }

    getNodePairs() {
        const solution = this.props.mainProps.solution.RawSolution();

        let last: number = null;
        let indexPairs: [number, number][] = [];
        for(let i = 0; i < solution.length; i++) {
            let node = solution[i];

            if(last === null) {
                last = node.Index();
                continue;
            }

            indexPairs.push([last, node.Index()]);
            last = node.Index();
        }

        return indexPairs;
    }
}

class SolutionSegment extends React.Component<SolutionSegmentProps, {}> {
    render() {
        const main = this.props.mainProps;
        const cWidth = main.cellWidth;
        const margin = main.cellMargin;
        const actualIndex = Math.min(this.props.fromIndex, this.props.toIndex);
        const horz = Math.abs(this.props.fromIndex - this.props.toIndex) === 1;

        let [left, top] = this.indexToLeftTop(actualIndex);

        const longSide = cWidth + margin * 4;
        const shortSide = margin * 2;

        var style = {
            position: 'absolute',
            width: horz ? longSide : shortSide,
            height: horz ? shortSide : longSide,
            left: left,
            top: top
        };

        return <div className="solutionSegment" style={style} />;
    }

    indexToLeftTop(index: number) {
        let [left, top] = nodeCenterIndex(index, this.props.mainProps);
        const margin = this.props.mainProps.cellMargin;

        return [left - 2 * margin, top - 2 * margin];
    }
}

interface RuleProps {
    mainProps: GridRendererProps
}

class Rules extends React.Component<RuleProps, {}> {
    render() {
        const mainProps = this.props.mainProps;
        const children = mainProps.solver.Rules()
            .map(r => ruleFactory(r, mainProps))
            .filter(el => !!el);

        return <div className="rules">
            {children}
        </div>;
    }
}

interface CatProps {
    mainProps: GridRendererProps,
    rule: CellCategory,
    width?: number,
    height?: number,
    colors?: string[]
}


class CellCategoryRule extends React.Component<CatProps, {}> {
    render() {
        var props = this.props.mainProps;
        var rule = this.props.rule;
        const width = this.props.width || props.cellWidth / 2;
        const height = this.props.width || props.cellWidth / 2;

        const children = rule.Categories().map((c, i) => {
            if(!c) return null;

            const [left, top] = this.indexToLeftTop(i);
            const style = {
                position: 'absolute',
                width: width,
                height: height,
                left: left,
                top: top,
                backgroundColor: this.colorFromRegion(c)
            };

            return <div style={style} className="cellCategory" />
        }).filter(el => !!el);

        return <div className="cellCategoryGroup">
            {children}
        </div>;
    }

    colorFromRegion(categoryNumber: number) {
        const colors = this.props.colors || [
            'red',
            'limegreen',
            'blue',
            'purple',
            'white',
            'black'
        ];

        return colors[categoryNumber];
    }

    indexToLeftTop(cellIndex: number) {
        const mainProps = this.props.mainProps;
        const width = this.props.width || mainProps.cellWidth / 2;
        const height = this.props.width || mainProps.cellWidth / 2;
        const [x, y] = cellCenterIndex(cellIndex, mainProps);

        const left = x - width / 4;
        const top = y - height / 4;

        return [left, top];
    }
}

interface VisitProps {
    mainProps: GridRendererProps,
    rule: RequiredVisit,
    width?: number,
    height?: number,
    color?: string
}

class VisitRule extends React.Component<VisitProps, {}> {
    render() {
        var props = this.props.mainProps;
        var rule = this.props.rule;
        const width = this.props.width || props.cellWidth / 2;
        const height = this.props.width || props.cellWidth / 2;

        const children = rule.Visits().map(visit => {
            const [left, top] = this.indexToLeftTop(visit);
            const style = {
                position: 'absolute',
                width: width,
                height: height,
                left: left,
                top: top,
                backgroundColor: this.color()
            };

            return <div style={style} className="visit" />
        }).filter(el => !!el);

        return <div className="visitGroup">
            {children}
        </div>;
    }

    color() {
        return this.props.color || 'black';
    }

    indexToLeftTop(visit: number[]) {
        const mainProps = this.props.mainProps;
        const width = this.props.width || mainProps.cellWidth / 2;
        const height = this.props.width || mainProps.cellWidth / 2;

        let left: number, top: number;
        if(visit.length === 1) {
            [left, top] = nodeCenterIndex(visit[0], mainProps);
        } else {
            const min = Math.min(visit[0], visit[1]);
            const max = Math.max(visit[0], visit[1]);

            const [lx, ly] = nodeCenterIndex(min, mainProps);
            const [hx, hy] = nodeCenterIndex(max, mainProps);

            left = lx + (hx - lx)/2;
            top = ly + (hy - ly)/2;
        }

        left -= width + width / 2;
        top -= height + height / 2;

        return [left, top];
    }

}

function ruleFactory(rule: Rule, mainProps: GridRendererProps) {
    if(rule instanceof CellCategory) {
        return <CellCategoryRule mainProps={mainProps} rule={rule} />;
    }

    if(rule instanceof RequiredVisit) {
        return <VisitRule width={10} height={10} mainProps={mainProps} rule={rule} />
    }

    return null;
}

function cellToIndex(cellX: number, cellY: number, grid: Grid) {
    return cellX + cellY * grid.CellY();
}

function indexToCell(cellIndex: number, grid: Grid): [number, number] {
    return [
        cellIndex % grid.CellX(),
        Math.floor(cellIndex / grid.CellX())
    ];
}

function nodeToIndex(nodeX: number, nodeY: number, grid: Grid) {
    return nodeX + nodeY * grid.X();
}

function indexToNode(nodeIndex: number, grid: Grid): [number, number] {
    return [
        nodeIndex % grid.X(),
        Math.floor(nodeIndex / grid.X())
    ];
}

function nodeCenter(nodeX: number, nodeY: number, props: GridRendererProps): [number, number] {
    const margin = props.cellMargin;
    const width = props.cellWidth;

    const left = (margin * 2 + width) * nodeX + margin;
    const top = (margin * 2 + width) * nodeY + margin;

    return [left, top];
}

function nodeCenterIndex(nodeIndex: number, props: GridRendererProps) {
    const [x, y] = indexToNode(nodeIndex, props.grid);
    return nodeCenter(x, y, props);
}

function cellCenter(cellX: number, cellY: number, props: GridRendererProps): [number, number] {
    const margin = props.cellMargin;
    const width = props.cellWidth;

    const left = (margin * 2 + width) * cellX + width / 2;
    const top = (margin * 2 + width) * cellY + width / 2;

    return [left, top];
}

function cellCenterIndex(cellIndex: number, props: GridRendererProps) {
    const [x, y] = indexToCell(cellIndex, props.grid);
    return cellCenter(x, y, props);
}

class GridRow extends React.Component<RowProps, {}> {
    render() {
        return <div className="gridRow">
            {this.props.cells.map(c =>
                <GridCell {...c} />
            )}
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

