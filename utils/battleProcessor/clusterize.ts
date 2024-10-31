const NOISE_LABEL = 0;

export async function densityClusterize<Point>(
  data: Point[],
  pointExtract: (value: Point) => { x: number; y: number; battleIndex: number },
  eps: number,
  minPts: number,
  clusterSizeThreshold: number,
): Promise<{
  data: number[];
  clusterCount: number;
}> {
  const { clusterize_with_limit, BarPartialPlayerData } = await import(
    "~/rstar/pkg/bar_stats_wasm"
  );

  const transformedPoints = data.map((v) => {
    const point = pointExtract(v);
    return new BarPartialPlayerData(point.battleIndex, point.x, point.y);
  });

  // TODO add max clusterization limit
  const clusters = clusterize_with_limit(transformedPoints, eps, minPts, 10000, clusterSizeThreshold);

  const result = {
    data: Array.from(clusters.labels),
    clusterCount: clusters.cluster_count,
  };
  clusters.free();
  return result;
}

export async function depthClusterizeJS<Point>(
  data: Point[],
  pointExtract: (value: Point) => [number, number],
  eps: number,
  minPts: number,
): Promise<{
  data: number[];
  clusterCount: number;
}> {
  const { SpatialIndex } = await import("~/rstar/pkg/bar_stats_wasm");
  const kdtree = new SpatialIndex();
  for (let i = 0; i < data.length; i++) {
    const [x, y] = pointExtract(data[i]);
    kdtree.add(i, x, y);
  }
  const labels = new Array<number>(data.length).fill(-1);
  let labelCount = 1;

  for (let i = 0; i < data.length; i++) {
    const p = data[i];
    if (labels[i] !== -1) {
      continue;
    }
    const pPoint = pointExtract(p);
    const neighbors = Array.from(kdtree.range_query(pPoint[0], pPoint[1], eps));
    if (neighbors.length < minPts) {
      labels[i] = NOISE_LABEL;
      continue;
    }

    const label = labelCount++;
    labels[i] = label;
    const seeds = neighbors.filter((v) => v !== i);
    let j = 0;
    while (j < seeds.length) {
      const qIndex = seeds[j];
      const q = data[qIndex];
      if (labels[qIndex] === NOISE_LABEL) {
        labels[qIndex] = label;
      } else if (labels[qIndex] > 0) {
        j++;
        continue;
      }
      labels[qIndex] = label;
      const qPoint = pointExtract(q);
      const qNeighbors = kdtree.range_query(qPoint[0], qPoint[1], eps);
      if (qNeighbors.length >= minPts) {
        seeds.push(...qNeighbors.filter((v) => labels[v] > 0));
      }
      j++;
    }
  }
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
        if (d === null) {
          continue;
        }
        if (d <= closenessThreshold) {
          foundMatch = true;
          for (let k = 0; k < data.length; k++) {
            if (data[k][1] === j) data[k][1] = i;
          }
        }
      }
    }
  }
}
