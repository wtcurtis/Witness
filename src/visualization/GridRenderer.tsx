///<reference path="../core/Grid.ts"/>
///<reference path="../core/Graph.ts"/>
///<reference path="../../typings/main.d.ts"/>
import {Grid} from "../core/Grid";
import {Node} from "../core/Graph";
import React = require('react');

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


        return <div className="Grid">
            {children}
        </div>;
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

        left = horz ? left + margin : left - margin;
        top = horz ? top - margin : top + margin;

        const width = horz ? cWidth : margin * 2;
        const height = horz ? margin * 2 : cWidth;

        var style = {
            position: 'absolute',
            width: width,
            height: height,
            left: left,
            top: top
        };

        return <div className="solutionSegment" style={style} />;
    }

    indexToLeftTop(index: number) {
        const props = this.props.mainProps;
        const gridX = props.grid.X();
        const margin = props.cellMargin;
        const width = props.cellWidth;
        const x = index % gridX;
        const y = Math.floor(index / gridX);

        const left = (margin * 2 + width) * x;
        const top = (margin * 2 + width) * y;

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
        var className = "gridCell";

        if(!this.props.mainProps.grid.CellExists(this.props.x, this.props.y)) {
            className += " dead";
        }

        var colors = [
            'black',
            'steelblue',
            'lightsteelblue',
            'green',
            'red',
            'blue'
        ];

        const style = {
            width: this.props.mainProps.cellWidth,
            height: this.props.mainProps.cellWidth,
            margin: this.props.mainProps.cellMargin,
            backgroundColor: colors[this.props.region]
        };

        return <div className={className} style={style} />;
    }
}

