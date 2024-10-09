import { KDTree } from "../other/kdtree";

const NOISE_LABEL = 0;

function constructNeighbors<Point>(
  data: Point[],
  distFunc: (a: Point, b: Point) => number,
  eps: number,
) {
  const currentNeighbors: number[][] = [];
  for (let i = 0; i < data.length; i++) {
    const ip = data[i];
    for (let j = 0; j < data.length; j++) {
      const jp = data[j];
    }
  }
}

export function depthClusterize<Point>(
  data: Point[],
  pointExtract: (value: Point) => [number, number],
  eps: number,
  minPts: number,
): {
  data: number[];
  clusterCount: number;
} {
  //const distance =
  const kdtree = new KDTree(
    data.map((v, i) => [i, v] as const),
    (v) => pointExtract(v[1]),
  );
  const labels = new Array<number>(data.length).fill(-1);
  let labelCount = 1;

  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (labels[i] !== -1) {
      continue;
    }
    const distance = (a: Point, b: Point) => {
      const [ax, ay] = pointExtract(a);
      const [bx, by] = pointExtract(b);
      return Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
    };
    const neighbors = kdtree.rangeSearch([i, p], eps, (a, b) => a[0] === b[0]);
    //const neighbors = rangeQuery(data, distance, p, eps);
    if (neighbors.length < minPts) {
      labels[i] = NOISE_LABEL;
      continue;
    }

    const label = labelCount++;
    labels[i] = label;
    const seeds = neighbors.filter((v) => v[0] !== i);
    let j = 0;
    console.log("clustering", i);
    while (j < seeds.length) {
      //console.log("seeds", i, seeds);
      const [qIndex, q] = seeds[j];
      if (labels[qIndex] === NOISE_LABEL) {
        labels[qIndex] = label;
      } else if (labels[qIndex] > 0) {
        //console.log("ignoring");
        j++;
        continue;
      }
      labels[qIndex] = label;
      const qNeighbors = kdtree.rangeSearch([qIndex, q], eps, (a, b) => a[0] === b[0])
      //const qNeighbors = rangeQuery(data, distance, q, eps);
      //console.log("qNeighbors", qNeighbors);
      if (qNeighbors.length >= minPts) {
        seeds.push(...qNeighbors.filter((v) => labels[v[0]] > 0));
      }
      j++;
    }
  }
  console.log("clusterization result", labels);
  return {
    data: labels,
    clusterCount: labelCount,
  };
}
export function singleLinkCloseness<Point>(
  data: [Point, number][],
  clusterA: number,
  clusterB: number,
  distFunc: (a: Point, b: Point) => number,
): number | null {
  let minDistance: number | null = null;
  for (let i = 0; i < data.length; i++) {
    const [aPoint, aPointCluster] = data[i];
    if (aPointCluster !== clusterA) continue;

    for (let j = 0; j < data.length; j++) {
      const [bPoint, bPointCluster] = data[j];
      if (bPointCluster !== clusterB) continue;

      const dist = distFunc(aPoint, bPoint);
      if (minDistance === null || dist < minDistance) {
        minDistance = dist;
      }
    }
  }
  return minDistance;
}

export type DistanceFunc<Point> = (a: Point, b: Point) => number;
export type ClosenessFunc<Point> = (
  data: [Point, number][],
  clusterA: number,
  clusterB: number,
  distFunc: DistanceFunc<Point>,
) => number | null;

//function centroidCloseness<Point>(
//  data: [Point, number][],
//  clusterA: number,
//  clusterB: number,
//  distFunc: (a: Point, b: Point) => number,
//) {
//
//    for(let i = 0; i < data.length; i++) {
//      const [point, pointCluster] = data[i]
//      if(pointCluster === clusterA || pointCluster === clusterB) {
//
//      }
//    }
//  }

export function agglomerativeClusterize<Point>(
  data: [Point, number][],
  clusterMax: number,
  closeness: ClosenessFunc<Point>,
  distance: DistanceFunc<Point>,
  closenessThreshold: number,
) {
  let foundMatch = true;
  while (foundMatch) {
    foundMatch = false;

    for (let i = 0; i <= clusterMax; i++) {
      if (data.every((v) => v[1] !== i)) continue;
      for (let j = 0; j <= clusterMax; j++) {
        if (i === j) continue;
        const d = closeness(data, i, j, distance);
        //console.count("agglomerative clusterize");
        if (d === null) {
          continue;
        }
        if (d <= closenessThreshold) {
          console.log(
            "",
            i,
            data.filter((v) => v[1] === i).length,
            j,
            data.filter((v) => v[1] === j).length,
            d,
          );
          foundMatch = true;
          for (let k = 0; k < data.length; k++) {
            if (data[k][1] === j) data[k][1] = i;
          }
        }
      }
    }
  }
}

function rangeQuery<Point>(
  data: Point[],
  distFunc: (a: Point, b: Point) => number,
  q: Point,
  eps: number,
): [index: number, Point][] {
  const neighbors: [index: number, Point][] = [];
  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (distFunc(q, p) <= eps) {
      neighbors.push([i, p]);
    }
  }
  return neighbors;
}

//function calculateCoreSize(
//  data: [number, number][],
//  point: [number, number],
//  coreSize: number,
//) {
//  const corePoints : [number, number][] = []
//
//  for(let i = 0; i < data.length; i++) {
//    if(data[i] !== point) {
//      if(corePoints.length < coreSize) {
//        corePoints.push(data[i])
//      }
//      else if(corePoints.at(-1) - point)
//    }
//  }
//
//
//}
//
//function sqDistance() {
//
//}
