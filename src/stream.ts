export class Stream<T> {
  private index = -1;

  public constructor(public collection: T[]) {}

  public getAll() {
    return [...this.collection];
  }

  public next() {
    this.index += 1;

    return this.collection[this.index];
  }

  public prev() {
    this.index -= 1;

    return this.collection[this.index];
  }

  public isFinished() {
    return this.index >= this.collection.length - 1;
  }
}
