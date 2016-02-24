///<reference path="../core/Grid.ts"/>
///<reference path="../../typings/main.d.ts"/>
///<reference path="../core/GridSolver.ts"/>
import {Grid} from "../core/Grid";
import {Node} from "../core/Graph";
import {HtmlGridRenderer} from "./GridRenderer";

import React = require('react');
import ReactDom = require('react-dom');
import {GridSolver} from "../core/GridSolver";
import {CellCategory} from "../core/rules/CellCategory";
import {RequiredVisit} from "../core/rules/RequiredVisit";

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

const solver = new GridSolver(grid, [0], [35, 5], true);
const cats = new CellCategory(grid);

cats.AddCategoryAt(1, 0, 0);
cats.AddCategoryAt(1, 4, 0);
cats.AddCategoryAt(2, 0, 2);
cats.AddCategoryAt(3, 0, 4);
solver.AddRule(cats);

const visits = new RequiredVisit(grid);
visits.AddEdgeVisit(1, 7);
visits.AddEdgeVisit(6, 12);
visits.AddEdgeVisit(13, 19);
visits.AddEdgeVisit(18, 24);
visits.AddEdgeVisit(25, 31);

solver.AddRule(visits);
ReactDom.render(React.createElement(HtmlGridRenderer, {
    grid: grid,
    //solution: [0, 1, 7, 13, 19, 25, 31, 32, 26, 20, 14, 8, 2, 3, 4, 5, 11, 10, 16, 17, 23, 22, 28, 29].map(n => grid.Graph().NodeAt(n)),
    solution: [0].map(n => grid.Graph().NodeAt(n)),
    solver: solver,
    cellWidth: 80,
    cellMargin: 10
}), document.getElementById('grid'));
