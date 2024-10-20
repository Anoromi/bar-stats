export function avgPoint<Point>(
  points: Point[],
  extractData: (value: Point) => [number, number],
) : [number, number] {
  let x = 0;
  let y = 0;

  for (const p of points) {
    const extracted = extractData(p);
    x += extracted[0] / points.length;
    y += extracted[1] / points.length;
  }

  console.log("avg", x, y);
  return [x, y];
}
