export class Stack<T> {
    private arr: T[];
    private index: number = 0;
    private size: number = 0;

    constructor(size: number) {
        this.arr = new Array<T>(size);
        this.size = 0;
        this.index = 0;
    }

    push(item: T) {
        this.arr[this.index++] = item;
        this.size++;

        return this.size;
    }

    pop() {
        const item = this.arr[--this.index];
        this.size--;

        return item;
    }

    peek() {
        return this.arr[this.index];
    }

    Size() { return this.index > 0; }
}