import {Stack} from "./Stack";

export function benchmark<T>(runs: number, init: () => T, run: (thing: T) => void) {
    var initTime: number = 0;
    var runTime: number = 0;

    for(var i = 0; i < runs; i++) {
        var start = +new Date();
        var thing = init();
        var end = +new Date();

        initTime += (end - start);

        start = +new Date();
        run(thing);
        end = +new Date();

        runTime += <number>(end - start);
    }

    return {
        "init": initTime,
        "run": runTime
    };
}

export interface StackLike<T> {
    push: (t: T) => number,
    pop: () => T
}

function runOf(n: number) {
    return (stack: StackLike<number>) => {
        for(var j = 0; j < n; j++) stack.pop();
        for(var j = 0; j < n; j++) stack.push(j);
    };
}

function benchmarkCustom(n: number, runs: number) {
    return benchmark<Stack<number>>(runs,
        () => {
            var stack: Stack<number> = new Stack<number>(n);
            for(var j = 0; j < n; j++) stack.push(j);

            return stack;
        },
        runOf(n)
    )
}

function benchmarkNative(n: number, runs: number) {
    return benchmark<number[]>(runs,
        () => {
            var stack: number[] = [];
            for(var j = 0; j < n; j++) stack.push(j);

            return stack;
        },
        runOf(n)
    )
}

function benchmarkNativePrealloc(n: number, runs: number) {
    return benchmark<number[]>(runs,
        () => {
            var stack: number[] = new Array(n);
            for(var j = 0; j < n; j++) stack.push(j);

            return stack;
        },
        runOf(n)
    )
}

export function benchStack() {
    var runs: [number, number][] = [[100, 10], [10000, 10], [1000000, 10]];
    var result = _.map(runs, r => {
        return {
            "n": r[0],
            "runs": r[1],
            "native": benchmarkNative(r[0], r[1]),
            "prealloc": benchmarkNativePrealloc(r[0], r[1]),
            "custom": benchmarkCustom(r[0], r[1])
        };
    });

    _.each(result, r => console.log(r));

}
