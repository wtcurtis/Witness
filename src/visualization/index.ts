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

const n = 6;


//var region = grid.DetermineAllRegions([18, 19, 20, 14, 8, 2].map(n => grid.Graph().NodeAt(n))); console.log(region);
//
//var region = grid.DetermineAllRegions([6, 7, 1, 2, 3, 4, 10, 11].map(n => grid.Graph().NodeAt(n)));
//console.log(region);

//grid.Graph().DeleteNodeAt(0);

//grid.DeleteNode(0)
//    .DeleteNode(9)
//    .DeleteNode(99)
//    .DeleteNode(90);

const [solver, grid] = getSolverPairs();
window[<any>'rendered'] = <any>ReactDom.render(React.createElement(HtmlGridRenderer, {
    grid: grid,
    //solution: [0, 1, 7, 13, 19, 25, 31, 32, 26, 20, 14, 8, 2, 3, 4, 5, 11, 10, 16, 17, 23, 22, 28, 29].map(n => grid.Graph().NodeAt(n)),
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
    tetris.AddLineBlock([0, 1]);
    tetris.AddLBlockR([0, 2], true, 1);
    //tetris.AddLBlockR([2, 1], true);
    //tetris.AddLBlockL([3, 1], true);
    //tetris.AddZBlockR([4, 1], true);
    //tetris.AddZBlockL([2, 2], true);
    solver.AddRule(tetris);

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
