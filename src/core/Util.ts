export function assert(thing: any, format: string = null, ...args: any[]) {
    if(thing) return;

    var index = 0;
    var message = format
        ? format.replace(/%s/g, () => args[index++])
        : "Failed assertion";
    throw new Error(message);
}

export function cloneArray<T>(a: T[]) : T[] {
    var newArr = new Array<T>(a.length);
    var i = a.length;
    while(i--) newArr[i] = a[i];

    return newArr;
}

export function clonePairArray<T>(a: Pair<T>[]) {
    const cloned = cloneArray(a);

    for(let i = 0; i < cloned.length; i++) {
        cloned[i] = [cloned[i][0], cloned[i][1]];
    }

    return cloned;
}

export function clonePush<T>(arr: T[], next: T) {
    var cloned = cloneArray(arr);
    cloned.push(next);

    return cloned;
}

export function notPresent<T>(haystack: T[], needles: T[]) {
    var result : T[] = [];

    for(var i = 0; i < needles.length; i++) {
        var outer = needles[i];
        for(var j = 0; j < haystack.length; j++) {
            if(outer === haystack[j]) break;
        }

        if(j === haystack.length) result.push(outer);
    }

    return result;
}

export function last<T>(a: T[]) {
    return a[a.length-1];
}

export type Pair<T> = [T, T];
