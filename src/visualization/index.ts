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

const n = 6;

const grid = new Grid(n, n);

//var region = grid.DetermineAllRegions([18, 19, 20, 14, 8, 2].map(n => grid.Graph().NodeAt(n))); console.log(region);
//
//var region = grid.DetermineAllRegions([6, 7, 1, 2, 3, 4, 10, 11].map(n => grid.Graph().NodeAt(n)));
//console.log(region);

//grid.Graph().DeleteNodeAt(0);

//grid.DeleteNode(0)
//    .DeleteNode(9)
//    .DeleteNode(99)
//    .DeleteNode(90);

const solver = getSolverFull(grid);
window[<any>'rendered'] = <any>ReactDom.render(React.createElement(HtmlGridRenderer, {
    grid: grid,
    //solution: [0, 1, 7, 13, 19, 25, 31, 32, 26, 20, 14, 8, 2, 3, 4, 5, 11, 10, 16, 17, 23, 22, 28, 29].map(n => grid.Graph().NodeAt(n)),
    solution: new GraphSolution([0].map(n => grid.Graph().NodeAt(n))),
    solver: solver,
    cellWidth: 80,
    cellMargin: 10
}), document.getElementById('grid'));

function getSolverFull(grid: Grid) {
    const solver = new GridSolver(grid, [0], [35, 5], true);
    const cats = new CellCategory(grid);

    const [maxX, maxY] = [grid.CellX() - 1, grid.CellY() - 1];

    cats.AddCategoryAt(1, 0, 0);
    cats.AddCategoryAt(1, maxX, 0);
    cats.AddCategoryAt(1, 0, maxY);
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

    return solver;
}

function get6Solver(grid: Grid) {
    const solver = new GridSolver(grid, [0], [35, 5], true);
    const cats = new CellCategory(grid);

    cats.AddCategoryAt(1, 0, 0);
    cats.AddCategoryAt(2, 0, 2);
    cats.AddCategoryAt(3, 0, 4);
    cats.AddCategoryAt(1, 4, 0);
    cats.AddCategoryAt(2, 4, 2);
    solver.AddRule(cats);

    const visits = new RequiredVisit(grid);
    visits.AddNodeVisit(2);
    visits.AddEdgeVisit(1, 7);
    visits.AddEdgeVisit(6, 12);
    visits.AddEdgeVisit(13, 19);
    visits.AddEdgeVisit(18, 24);
    visits.AddEdgeVisit(25, 31);

    solver.AddRule(visits);

    return solver;
}
