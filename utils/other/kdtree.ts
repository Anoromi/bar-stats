import { assert } from "./assert";
import { randomInt } from "./rand";

class Node<T> {
  public parent: Node<T> | null = null;
  constructor(
    public value: T,
    public leftChildren: Node<T> | null = null,
    public rightChildren: Node<T> | null = null,
  ) {}
}

type Comparator<T> = (a: T, b: T) => number;

function createNode<T>(
  parent: Node<T> | null,
  data: T[],
  comparator: Comparator<T>,
  otherComparator: Comparator<T>,
): Node<T> {
  console.assert(data.length > 0);
  const meanIndex = closestMean(data, comparator);
  console.assert(meanIndex >= 0, data, meanIndex);
  const mean = data[meanIndex];
  const left = data.filter((v) => comparator(v, mean) <= 0 && v !== mean);
  const right = data.filter((v) => comparator(v, mean) > 0);

  const node = new Node(mean);
  node.parent = parent;
  if (left.length > 0)
    node.leftChildren = createNode(node, left, otherComparator, comparator);
  if (right.length > 0)
    node.rightChildren = createNode(node, right, otherComparator, comparator);
  return node;
}

export class KDTree<T> {
  root: Node<T> | null = null;

  private pointExtract: (data: T) => [number, number];

  compareX: Comparator<T> = (a, b) =>
    this.pointExtract(a)[0] - this.pointExtract(b)[0];
  compareY: Comparator<T> = (a, b) =>
    this.pointExtract(a)[1] - this.pointExtract(b)[1];

  constructor(data: T[], pointExtract: (data: T) => [number, number]) {
    this.pointExtract = pointExtract;

    if (data.length > 0)
      this.root = createNode(
        null,
        data,
        (a: T, b: T) => pointExtract(a)[0] - pointExtract(b)[0],
        (a: T, b: T) => pointExtract(a)[1] - pointExtract(b)[1],
      );
  }

  private comparatorByAxis(index: number) {
    assert(index === 0 || index === 1);
    switch (index) {
      case 0:
        return this.compareX;
      case 1:
        return this.compareY;
    }
  }

  private distance(a: T, b: T) {
    const [ax, ay] = this.pointExtract(a);
    const [bx, by] = this.pointExtract(b);
    return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
  }

  private distanceByAxis(index: number, a: T, b: T) {
    assert(index === 0 || index === 1);

    const [ax, ay] = this.pointExtract(a);
    const [bx, by] = this.pointExtract(b);
    switch (index) {
      case 0:
        return Math.abs(bx - ax);
      case 1:
        return Math.abs(by - ay);
    }
  }

  private nextAxis(index: number) {
    return (index + 1) % 2;
  }

  private previousAxis(index: number) {
    if (index === 0) return 1;
    return index - 1;
  }

  printTree() {
    this.printNode(this.root, 0);
  }

  private printNode(node: Node<T> | null, offset: number) {
    const spaces = " ".repeat(offset);
    if (node === null) {
      console.log(spaces, "null");
      return;
    }
    console.log(spaces, node.value);
    this.printNode(node.leftChildren, offset + 4);
    this.printNode(node.rightChildren, offset + 4);
  }

  rangeSearch(
    searched: T,
    eps: number,
    equality: (a: T, b: T) => boolean,
  ): T[] {
    return this.nodeRangeSearch(this.root, searched, eps, 0, equality);
  }

  private nodeRangeSearch(
    rootNode: Node<T> | null,
    searched: T,
    eps: number,
    initialComparatorKind: number,
    equal: (a: T, b: T) => boolean,
  ): T[] {
    if (rootNode === null) return [];
    let previousNode: Node<T> | null = null;
    let node: Node<T> | null = rootNode;
    let comparatorKind = initialComparatorKind;
    while (node !== null) {
      previousNode = node;
      const comparator = this.comparatorByAxis(comparatorKind);
      if (comparator(searched, node.value) <= 0) {
        node = node.leftChildren;
      } else {
        node = node.rightChildren;
      }
      comparatorKind = this.nextAxis(comparatorKind);
    }

    if (previousNode === null) throw new Error("Tree is empty");

    comparatorKind = this.previousAxis(comparatorKind);
    node = previousNode;
    previousNode = null;
    const points: T[] = [];
    while (node !== rootNode.parent && node !== null) {
      if (
        this.distance(searched, node.value) <= eps &&
        !equal(searched, node.value)
      )
        points.push(node.value);

      const comparator = this.comparatorByAxis(comparatorKind);
      const axisDistance = this.distanceByAxis(
        comparatorKind,
        searched,
        node.value,
      );
      let internalValues: T[] | null = null;
      if (previousNode !== node.rightChildren && axisDistance <= eps) {
        // came from left
        internalValues = this.nodeRangeSearch(
          node.rightChildren,
          searched,
          eps,
          this.nextAxis(comparatorKind),
          equal,
        );
      } else if (previousNode !== node.leftChildren && axisDistance <= eps) {
        // came from right
        internalValues = this.nodeRangeSearch(
          node.leftChildren,
          searched,
          eps,
          this.nextAxis(comparatorKind),
          equal,
        );
      }
      if (internalValues !== null) {
        points.push(...internalValues);
      }
      previousNode = node;
      node = node.parent;
      comparatorKind = this.previousAxis(comparatorKind);
    }
    return points;
  }
}

const medianMaxValues = 10000;

function closestMean<T>(values: T[], compare: (a: T, b: T) => number) {
  if (values.length < 0) return -1;
  const max = Math.min(values.length, medianMaxValues);
  const selectedItems: number[] = [];
  while (selectedItems.length < max) {
    const i = randomInt(0, values.length - 1);
    if (!selectedItems.includes(i)) selectedItems.push(i);
  }
  selectedItems.sort((a, b) => compare(values[a], values[b]));
  return selectedItems[Math.floor(selectedItems.length / 2)];
}
