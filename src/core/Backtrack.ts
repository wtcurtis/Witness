/// <reference path="Graph.ts" />
///<reference path="Solution.ts"/>
import {Graph, Node} from "./Graph";
import {clonePush} from "./Util";
import {Solution} from "./Solution";

export var totalInBt = 0;

export function Backtrack<T>(
    start: Solution<T>,
    reject: (s: Solution<T>) => boolean,
    accept: (s: Solution<T>) => boolean,
    choices: (s: Solution<T>) => T[],
    output: (s: Solution<T>) => void,
    solutionCount: number = -1
)
{
    totalInBt = 0;
    let foundSolutions = 0;
    const bt = function(s: Solution<T>) {
        totalInBt++;

        if(totalInBt % 100000 === 0) {
            console.log("In backtrack for " + totalInBt);
        }

        if(reject(s)) return false;
        if(accept(s)) {
            output(s);
            return true;
        }

        const moves = choices(s);
        for(let i = 0; i < moves.length; i++) {
            const found = bt(s.CloneWith(moves[i]));
            if(!found) continue;

            foundSolutions++;
            if(solutionCount !== -1 && foundSolutions >= solutionCount) {
                return true;
            }
        }
    };

    bt(start);
    console.log('total in backtrack: ' + totalInBt);
}