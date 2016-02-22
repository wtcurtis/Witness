///<reference path="../core/Grid.ts"/>
///<reference path="../core/Graph.ts"/>
///<reference path="../../typings/main.d.ts"/>
import {Grid} from "../core/Grid";
import {Node} from "../core/Graph";
import React = require('react');
import {last} from "../core/Util";

export interface GridRendererProps {
    grid: Grid,
    solution: Node<number>[],
    cellWidth: number,
    cellMargin: number
}

export class HtmlGridRenderer extends React.Component<GridRendererProps, {}> {
    render() {
        const grid = this.props.grid;
        const solution = this.props.solution;
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


        return <div tabIndex={0} className="Grid" onKeyDown={this.keyDown.bind(this)}>
            {children}
        </div>;
    }

    moveSolution(x: number, y: number) {
        const solution = this.props.solution;
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

        this.forceUpdate();
    }

    keyDown(e: React.KeyboardEvent) {
        if(e.keyCode === 37) this.moveSolution(-1, 0);
        if(e.keyCode === 39) this.moveSolution(1, 0);
        if(e.keyCode === 38) this.moveSolution(0, -1);
        if(e.keyCode === 40) this.moveSolution(0, 1);
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
        const solution = this.props.mainProps.solution;

        let last: number = null;
        let indexPairs: [number, number][] = [];
        for(let i = 0; i < solution.length; i++) {
            let node = solution[i];

            if(!last) {
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
        const props = this.props.mainProps;
        const margin = props.cellMargin;
        const width = props.cellWidth;

        const gridX = props.grid.X();
        const x = index % gridX;
        const y = Math.floor(index / gridX);

        const left = (margin * 2 + width) * x - margin;
        const top = (margin * 2 + width) * y - margin;

        return [left, top];
    }
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

        let colors : string[] = [];
        for(let i = 250; i >= 10; i -= 50) {
            for(let j = 250; j >= 10; j -= 50) {
                colors.push('rgb(' + i  + ', ' + j + ', ' + i + ')');
            }
        }

        const style = {
            width: main.cellWidth,
            height: main.cellWidth,
            margin: main.cellMargin,
            backgroundColor: dead ? 'inherit' : colors[this.props.region]
        };

        return <div className="gridCell" style={style} />;
    }
}

