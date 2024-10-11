import { expect, test } from "vitest";
import { KDTree } from "./kdtree";

type Point = [number, number];
function distance(a: Point, b: Point) {
  const x = a[0] - b[0];
  const y = a[1] - b[1];
  return Math.sqrt(x * x + y * y);
}

function rangeQuery(dataset: Point[], point: Point, eps: number): Point[] {
  return dataset.filter((v) => distance(v, point) <= eps);
}

//test("basic test", () => {
//  const points: Point[] = [
//    [0, 0],
//    [1, 1],
//    [1, 2],
//
//    [5, 5],
//
//    [10, 10],
//    [11, 11],
//    [11, 12],
//  ];
//  const kdtree = new KDTree(points, (v) => v);
//  for (let x = 0; x < 11; x++) {
//    for (let y = 0; y < 11; y++) {
//      const eps1 = 10;
//      const rangeResult = rangeQuery(points, [x, y], eps1);
//      const kdResult = kdtree.rangeSearch([x, y], eps1, () => false);
//      //console.log("range", rangeResult);
//      //console.log("kd", kdResult);
//
//      for (const v of rangeResult) {
//        expect(kdResult).toContainEqual(v);
//      }
//    }
//  }
//});
//
//test("random test", () => {
//  const points: Point[] = Array(25)
//    .fill(0)
//    .map(() => [randomInt(0, 10000), randomInt(0, 10000)]);
//
//  //console.log(points)
//
//  const kdtree = new KDTree(points, (v) => v);
//  for (let x = 0; x < 11; x++) {
//    for (let y = 0; y < 11; y++) {
//      const eps1 = 8000;
//      const rangeResult = rangeQuery(points, [x, y], eps1);
//      const kdResult = kdtree.rangeSearch([x, y], eps1, () => false);
//      //console.log("range", rangeResult);
//      //console.log("kd", kdResult);
//
//      for (const v of rangeResult) {
//        expect(kdResult).toContainEqual(v);
//      }
//    }
//  }
//});

//test("faulty test", () => {
//  const points: Point[] = [
//    [3185.5673828125, 8417.2822265625],
//    [5162.79296875, 8281.240234375],
//    [5238.166015625, 8392.2109375],
//    [5467.5859375, 9490.6708984375],
//    //[381.3171997070313, 9648.1240234375],
//    //[1855.759521484375, 8229.720703125],
//    //[1932.4444580078125, 9623.1484375],
//    //[3526.63330078125, 9664.451171875],
//    //[5750.1865234375, 606.3698120117188],
//    //[3049.59521484375, 2005.0557861328125],
//    //[690.28564453125, 738.1876220703125],
//    //[5495.97119140625, 2046.8907470703125],
//    [4302.6904296875, 2024.2821044921875],
//    [1146.346435546875, 107.657470703125],
//    //[1150.7088623046875, 1887.213623046875],
//    [2814.7138671875, 769.5418701171875],
//    [3201.852783203125, 8259.5400390625],
//    [5492.74462890625, 9464.01953125],
//    [471.6370849609375, 9700.2587890625],
//    [3518.77734375, 9664.333984375],
//    [1864.4674072265625, 8230.556640625],
//    [5184.1015625, 8273.29296875],
//    [1936.791015625, 9618.1572265625],
//    [674.3413696289, 8223.595703125],
//    [4292.5927734375, 1996.0379638671875],
//    //[669.2938232421875, 775.61181640625],
//    [893.9288940429688, 1914.14501953125],
//    [4196.740234375, 629.826171875],
//    [5760.837890625, 621.6583251953125],
//    [3050.439697265625, 1992.333251953125],
//    [5496.08349609375, 2025.7298583984375],
//    [2826.315673828125, 742.3082885742188],
//  ];
//
//  //depthClusterize(points, (v) => v, 600, 2)
//
//  const kdtree = new KDTree(points, (v) => v);
//  //const kdtree = new KDTree(
//  //  points.map((v, i) => [i, v] as const),
//  //  (v) => v[1],
//  //);
//
//  kdtree.printTree();
//  //for (let i = 0; i < points.length; i++) {
//  const p = [5162.79296875, 8281.240234375] as Point;
//
//  const eps1 = 1000;
//  const rangeResult = rangeQuery(points, p, eps1);
//  console.log("searching for point", p);
//  const kdResult = kdtree.rangeSearch(p, eps1, (a, b) => false);
//  //.map((v) => v[1]);
//  console.log("range", rangeResult);
//  console.log("kd", kdResult);
//  console.log(p);
//
//  for (const v of rangeResult) {
//    expect(kdResult).toContainEqual(v);
//  }
//  for (const v of kdResult) {
//    expect(rangeResult).toContainEqual(v);
//  }
//  //}
//});

test("faulty test 2", () => {
  const points: Point[] = [
    [3215, 8257],
    //[385, 9643],
    //[1975, 9647],
    //[5130, 8260],
    //[3469, 9668],
    //[5473, 9491],
    //[1859, 8251],
    //[668, 8212],
    //[4299, 2001],
    //[3048, 1986],
    //[5778, 601],
    [2820, 748],
    //[1173, 1961],
    [5476, 2037],
    //[4202, 621],
    //[612, 846],
    [3185.5673828125, 8417.2822265625],
    [5162.79296875, 8281.240234375],
    [5238.166015625, 8392.2109375],
    //[5467.5859375, 9490.6708984375],
    [381.3171997070313, 9648.1240234375],
    //[1855.759521484375, 8229.720703125],
    [1932.4444580078125, 9623.1484375],
    //[3526.63330078125, 9664.451171875],
    //[5750.1865234375, 606.3698120117188],
    //[3049.59521484375, 2005.0557861328125],
    //[690.28564453125, 738.1876220703125],
    //[5495.97119140625, 2046.8907470703125],
    //[4302.6904296875, 2024.2821044921875],
    //[1146.346435546875, 107.657470703125],
    //[1150.7088623046875, 1887.213623046875],
    //[2814.7138671875, 769.5418701171875],
    //[3201.852783203125, 8259.5400390625],
    [5492.74462890625, 9464.01953125],
    [471.6370849609375, 9700.2587890625],
    //[3518.77734375, 9664.333984375],
    //[1864.4674072265625, 8230.556640625],
    //[5184.1015625, 8273.29296875],
    //[1936.791015625, 9618.1572265625],
    //[674.3413696289, 8223.595703125],
    [4292.5927734375, 1996.0379638671875],
    //[669.2938232421875, 775.61181640625],
    [893.9288940429688, 1914.14501953125],
    //[4196.740234375, 629.826171875],
    //[5760.837890625, 621.6583251953125],
    //[3050.439697265625, 1992.333251953125],
    //[5496.08349609375, 2025.7298583984375],
    //[2826.315673828125, 742.3082885742188],
  ];

  //depthClusterize(points, (v) => v, 600, 2)

  const kdtree = new KDTree(points, (v) => v);
  //const kdtree = new KDTree(
  //  points.map((v, i) => [i, v] as const),
  //  (v) => v[1],
  //);

  kdtree.printTree();
  //for (let i = 0; i < points.length; i++) {
  const p = [3215, 8257] as Point;

  const eps1 = 1000;
  const rangeResult = rangeQuery(points, p, eps1);
  console.log("searching for point", p);
  const kdResult = kdtree.rangeSearch(p, eps1, (a, b) => false);
  //.map((v) => v[1]);
  console.log("range", rangeResult);
  console.log("kd", kdResult);
  console.log(p);

  for (const v of rangeResult) {
    expect(kdResult).toContainEqual(v);
  }
  for (const v of kdResult) {
    expect(rangeResult).toContainEqual(v);
  }
  //}
});
