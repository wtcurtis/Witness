import {GridRendererProps} from "./GridRenderer";
import React = require('react');
import {nodeCenterIndex} from "./GridRenderer";

export interface SolutionProps {
    mainProps: GridRendererProps
}

export class Solution extends React.Component<SolutionProps, {}> {
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

interface SolutionSegmentProps {
    mainProps: GridRendererProps,
    fromIndex: number,
    toIndex: number
}

class SolutionSegment extends React.Component<SolutionSegmentProps, {}> {
    render() {
        const main = this.props.mainProps;
        const cWidth = main.cellWidth;
        const margin = main.cellMargin;
        const horz = Math.abs(this.props.fromIndex - this.props.toIndex) === 1;
        const actualIndex = horz
            ? Math.min(this.props.fromIndex, this.props.toIndex)
            : Math.max(this.props.fromIndex, this.props.toIndex);

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
