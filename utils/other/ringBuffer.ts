export class FixedRingBuffer<T> {
  private _size: number = 0;
  private offset: number = 0;
  private _arr: (T | undefined)[];

  constructor(capacity: number) {
    console.log('trying to create with capacity', capacity)
    this._arr = new Array(capacity);
  }

  push(value: T) {
    if (this.size() === this._arr.length) throw new Error("Size reached");

    this._arr[this.calculateIndex(this.size())] = value;
    this._size++;
  }

  pop(): T {
    if(this.size() === 0)
      throw new Error("No elements to remove")
    const result = this._arr[this.offset];
    this._arr[this.offset] = undefined;
    this.offset = this.calculateIndex(1);
    this._size--;
    return result!;
  }

  at(index: number): T {
    if (index > this.size()) throw new Error("Outside of bounds");
    return this._arr[this.calculateIndex(index)]!;
  }

  *values(): Generator<T> {
    for (let i = 0; i < this.size(); i++) {
      yield this.at(i);
    }
  }

  private calculateIndex(index: number): number {
    return (index + this.offset) % this._arr.length;
  }

  size(): number {
    return this._size;
  }
}
