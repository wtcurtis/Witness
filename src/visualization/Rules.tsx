import {GridRendererProps} from "./GridRenderer";
import React = require('react');
import {CellCategory} from "../core/rules/CellCategory";
import {RequiredVisit} from "../core/rules/RequiredVisit";
import {cellCenterIndex} from "./GridRenderer";
import {nodeCenterIndex} from "./GridRenderer";
import {Rule} from "../core/rules/Rule";
import {TetrisRule} from "../core/rules/TetrisRule";
import {cellCenter} from "./GridRenderer";
import {Pair} from "../core/Util";
import {TetrisBlock} from "../core/rules/TetrisRule";

export interface RuleProps {
    mainProps: GridRendererProps
}

export class Rules extends React.Component<RuleProps, {}> {
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

        const pairs = rule.PairCategories();
        for(let i = 0; i < pairs.length; i++) {
            const c = pairs[i];
            if(!c) continue;

            const [left, top] = this.indexToLeftTop(i);
            const style = {
                position: 'absolute',
                width: width,
                height: height,
                left: left,
                top: top,
                backgroundColor: this.colorFromRegion(c),
                transform: 'rotate(45deg)'
            };

            children.push(<div style={style} className="cellCategoryPair" />);
        }

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

interface TetrisProps {
    mainProps: GridRendererProps,
    rule: TetrisRule,
    color?: string
}

class TetrisRenderer extends React.Component<TetrisProps, {}> {
    render() {
        const allBlocks = this.props.rule.Blocks().map(b => {
            const children = this.getCellsFor(b);
            return <div className="tetrisBlock">{children}</div>;
        });

        return <div className="tetrisGroup">
            {allBlocks}
        </div>;
    }

    getCellsFor(block: TetrisBlock) {
        const mainProps = this.props.mainProps;

        const margin = 2;
        const maxX: number = _.maxBy(block.cells[0], c => c[0])[0];
        const maxY: number = _.maxBy(block.cells[0], c => c[1])[1];
        const size = mainProps.cellWidth * .15;
        const cellSize = (size - (margin * (Math.max(maxX, maxY) - 1)));
        const blockLoc = block.cellLocation;

        const [centerLeft, centerTop] = cellCenter(blockLoc[0], blockLoc[1], mainProps);
        const left = centerLeft - maxX / 2;
        const top = centerTop - maxY / 2;

        const children = block.cells[0].map((cell: Pair<number>) => {
            let [x, y] = cell;

            y = maxY - y;

            const style = {
                position: 'absolute',
                width: cellSize,
                height: cellSize,
                left: left + (x * cellSize) + margin * (x - 1),
                top: top + (y * cellSize) + margin * (y - 1),
                backgroundColor: this.color()
            };

            return <div style={style} className="tetrisCell" />
        }).filter(el => !!el);

        return children;
    }

    color() {
        return this.props.color || 'black';
    }
}

function ruleFactory(rule: Rule, mainProps: GridRendererProps) {
    if(rule instanceof CellCategory) {
        return <CellCategoryRule mainProps={mainProps} rule={rule} />;
    }

    if(rule instanceof RequiredVisit) {
        return <VisitRule width={10} height={10} mainProps={mainProps} rule={rule} />
    }

    if(rule instanceof TetrisRule) {
        return <TetrisRenderer rule={rule} mainProps={mainProps} />
    }

    return null;
}
