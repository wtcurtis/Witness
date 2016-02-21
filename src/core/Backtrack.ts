/// <reference path="Graph.ts" />
import {Graph, Node} from "./Graph";
import {clonePush} from "./Util";

export var totalInBt = 0;

export function Backtrack<T>(
    start: T,
    reject: (s: T[]) => boolean,
    accept: (s: T[]) => boolean,
    choices: (s: T[]) => T[],
    output: (s: T[]) => void,
    onlyFirstSolution: boolean = false
)
{
    const bt = function(s: T[]) {
        totalInBt++;
        if(reject(s)) return false;
        if(accept(s)) {
            output(s);
            return true;
        }

        const moves = choices(s);
        for(let i = 0; i < moves.length; i++) {
            const found = bt(clonePush(s, moves[i]));
            if(onlyFirstSolution && found) return true;
        }
    };

    bt([start]);
}