///<reference path="../core/Grid.ts"/>
///<reference path="../../typings/main.d.ts"/>
///<reference path="../core/GridSolver.ts"/>
///<reference path="../core/Solution.ts"/>
import {Grid} from "../core/Grid";
import {Node} from "../core/Graph";
import {HtmlGridRenderer} from "./GridRenderer";

import React = require('react');
import ReactDom = require('react-dom');
import {GridSolver} from "../core/GridSolver";
import {CellCategory} from "../core/rules/CellCategory";
import {RequiredVisit} from "../core/rules/RequiredVisit";
import {GraphSolution} from "../core/Solution";
import {TetrisRule} from "../core/rules/TetrisRule";
import {GridRendererProps} from "./GridRenderer";
import {Pair} from "../core/Util";
import {cloneArray} from "../core/Util";

const [solver, grid] = getTownAll5();
window[<any>'rendered'] = <any>ReactDom.render(React.createElement(HtmlGridRenderer, {
    grid: grid,
    solution: new GraphSolution([grid.Graph().NodeAt(solver.StartNodes()[0])]),
    solver: solver,
    cellWidth: 80,
    cellMargin: 10
}), document.getElementById('grid'));

function getSolverPairs(): [GridSolver, Grid] {
    const grid = new Grid(6, 6);
    const solver = new GridSolver(grid, [0], [35, 5], true);
    const cats = new CellCategory(grid);

    const [maxX, maxY] = [grid.CellX() - 1, grid.CellY() - 1];

    cats.AddPairCategoryAt(1, 0, 0);
    cats.AddPairCategoryAt(1, 0, maxY - 1);
    cats.AddPairCategoryAt(2, maxX, 0);
    cats.AddPairCategoryAt(2, maxX, maxY);

    solver.AddRule(cats);

    const tetris = new TetrisRule(grid);
    tetris.AddLineBlock([0, 1], true);
    tetris.AddLBlockR([0, 2], true, 1);
    //tetris.AddLBlockR([2, 1], true);
    //tetris.AddLBlockL([3, 1], true);
    tetris.AddZBlockR([3, 1], true);
    //tetris.AddZBlockL([2, 2], true);
    solver.AddRule(tetris);

    return [solver, grid];
}

function getTown1(): [GridSolver, Grid] {
    const grid = new Grid(6, 6);
    const solver = new GridSolver(grid, [0], [35], true);
    const cats = new CellCategory(grid);

    const [maxX, maxY] = [grid.CellX() - 1, grid.CellY() - 1];

    const pairs:Pair<number>[] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [2, 2]];
    pairs.forEach(p => cats.AddPairCategoryAt(1, p[0], p[1]));

    solver.AddRule(cats);

    const tetris = new TetrisRule(grid);
    const tPairs:Pair<number>[] = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]];

    tPairs.forEach(p => tetris.AddSmallLBlock(p, true));
    solver.AddRule(tetris);

    return [solver, grid];
}

function getTownAll1(): [GridSolver, Grid] {
    const grid = new Grid(5, 5);
    const solver = new GridSolver(grid, [0], [24], true);

    const tetris = new TetrisRule(grid);
    tetris.AddTBlock([0, 1], true);
    solver.AddRule(tetris);

    const visit = new RequiredVisit(grid);
    for(var i = 0; i < 25; i++) {
        visit.AddNodeVisit(i);
    }

    solver.AddRule(visit);

    return [solver, grid];
}

function getTownAll2(): [GridSolver, Grid] {
    const grid = new Grid(5, 5);
    const solver = new GridSolver(grid, [0], [24], true);

    const tetris = new TetrisRule(grid);
    tetris.AddTBlock([0, 1], true);
    tetris.AddBlock([[0, 0]], [1, 1]);
    solver.AddRule(tetris);

    const visit = new RequiredVisit(grid);
    for(var i = 0; i < 25; i++) {
        visit.AddNodeVisit(i);
    }

    solver.AddRule(visit);

    return [solver, grid];
}

function getTownAll3(): [GridSolver, Grid] {
    const grid = new Grid(5, 5);
    const solver = new GridSolver(grid, [0], [24], true);

    const tetris = new TetrisRule(grid);
    tetris.AddTBlock([0, 1], true);
    tetris.AddBlock([[0, 0]], [1, 1]);
    tetris.AddBlock([[0, 0]], [1, 0]);
    solver.AddRule(tetris);

    const visit = new RequiredVisit(grid);
    for(var i = 0; i < 25; i++) {
        visit.AddNodeVisit(i);
    }

    solver.AddRule(visit);

    return [solver, grid];
}

function getTownAll4(): [GridSolver, Grid] {
    const grid = new Grid(5, 5);
    const solver = new GridSolver(grid, [0], [24], true);

    const tetris = new TetrisRule(grid);
    tetris.AddTBlock([0, 1], true);
    tetris.AddTBlock([1, 1], true);
    solver.AddRule(tetris);

    const visit = new RequiredVisit(grid);
    for(var i = 0; i < 25; i++) {
        visit.AddNodeVisit(i);
    }

    solver.AddRule(visit);

    return [solver, grid];
}

function getTownAll5(): [GridSolver, Grid] {
    const grid = new Grid(5, 5);
    const solver = new GridSolver(grid, [0], [24], true);

    const tetris = new TetrisRule(grid);
    const cells: Pair<number>[] = [[0, 0], [0, 1], [0, 2]];
    tetris.AddBlock(cloneArray(cells), [0, 2], true);
    tetris.AddBlock(cloneArray(cells), [3, 2], true);
    solver.AddRule(tetris);

    const visit = new RequiredVisit(grid);
    for(var i = 0; i < 25; i++) {
        visit.AddNodeVisit(i);
    }

    solver.AddRule(visit);

    return [solver, grid];
}

function getSwampGreen1(): [GridSolver, Grid] {
    const grid = new Grid(6, 6);
    const solver = new GridSolver(grid, [2], [32], true);

    const tetris = new TetrisRule(grid);

    tetris.AddLBlockR([1, 1], true);
    tetris.AddLBlockL([3, 2], true);
    tetris.AddBlock([[0, 0], [0, 1]], [3, 0]);
    solver.AddRule(tetris);

    const cats = new CellCategory(grid);

    cats.AddPairCategoryAt(1, 0, 3);
    cats.AddPairCategoryAt(2, 1, 4);
    cats.AddPairCategoryAt(1, 4, 0);
    cats.AddPairCategoryAt(2, 4, 2);

    solver.AddRule(cats);

    return [solver, grid];
}

function getSwampGreen2(): [GridSolver, Grid] {
    const grid = new Grid(6, 6);
    const solver = new GridSolver(grid, [2], [32], true);

    const tetris = new TetrisRule(grid);

    tetris.AddBlock([
        [0, 0], [1, 0], [2, 0],
        [0, 1], [1, 1], [2, 1],
        [0, 2], [2, 2],
        [0, 3], [2, 3],
    ], [2, 2], true);
    solver.AddRule(tetris);

    const cats = new CellCategory(grid);

    cats.AddPairCategoryAt(1, 0, 2);
    cats.AddPairCategoryAt(1, 1, 2);
    cats.AddPairCategoryAt(1, 3, 2);
    cats.AddPairCategoryAt(1, 4, 2);
    cats.AddPairCategoryAt(1, 2, 3);
    cats.AddPairCategoryAt(1, 2, 4);

    solver.AddRule(cats);

    return [solver, grid];
}

function getCombinedSolver(): [GridSolver, Grid] {
    const grid = new Grid(6, 5);
    const solver = new GridSolver(grid, [3], [27], true);
    const cats = new CellCategory(grid);

    cats.AddCategoryAt(1, 0, 0);
    cats.AddCategoryAt(1, 1, 0);

    cats.AddPairCategoryAt(2, 0, 1);
    cats.AddPairCategoryAt(2, 1, 1);
    cats.AddPairCategoryAt(2, 0, 3);
    cats.AddPairCategoryAt(2, 1, 3);

    cats.AddCategoryAt(3, 0, 2);
    cats.AddCategoryAt(3, 1, 2);
    cats.AddCategoryAt(3, 2, 2);
    cats.AddCategoryAt(3, 2, 3);

    cats.AddPairCategoryAt(2, 3, 2);
    cats.AddPairCategoryAt(2, 3, 1);

    cats.AddCategoryAt(1, 4, 2);
    cats.AddCategoryAt(1, 4, 1);

    solver.AddRule(cats);
    return [solver, grid];
}

function getSolverFull(): [GridSolver, Grid] {
    const grid = new Grid(6, 6);
    const solver = new GridSolver(grid, [0], [35, 5], true);
    const cats = new CellCategory(grid);

    const [maxX, maxY] = [grid.CellX() - 1, grid.CellY() - 1];

    cats.AddPairCategoryAt(1, 0, 0);
    cats.AddPairCategoryAt(1, 0, maxY);
    cats.AddCategoryAt(1, maxX, 0);
    cats.AddCategoryAt(1, maxX, maxY);

    for(let i = 1; i < maxX; i++) cats.AddCategoryAt(2, i, 0);

    for(let i = 1; i < maxY; i++) {
        for(let j = 0; j <= maxX; j++) cats.AddCategoryAt(2, j, i);
    }

    for(let i = 1; i < maxX; i++) cats.AddCategoryAt(2, i, maxY);

    solver.AddRule(cats);

    var visits = new RequiredVisit(grid);
    for(let i = 0; i < grid.X() * grid.Y(); i++) {
        if(i === 30 || i === 35) continue;
        visits.AddNodeVisit(i);
    }

    solver.AddRule(visits);

    return [solver, grid];
}
