///<reference path="../Solution.ts"/>
///<reference path="../GridSolver.ts"/>
import {GraphSolution} from "../Solution";
import {GridSolver} from "../GridSolver";
export interface Rule {
    Reject(solution: GraphSolution) : boolean;
    SetSolver(solver: GridSolver) : void;
}