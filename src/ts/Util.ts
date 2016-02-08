export function assert(thing: any, format: string = null, ...args: any[]) {
    if(thing) return;

    var index = 0;
    var message = format
        ? format.replace(/%s/g, () => args[index++])
        : "Failed assertion";
    throw new Error(message);
}

export function cloneArray<T>(a: T[]) {
    var newArr = new Array<T>(a.length);
    var i = a.length;
    while(i--) newArr[i] = a[i];

    return newArr;
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