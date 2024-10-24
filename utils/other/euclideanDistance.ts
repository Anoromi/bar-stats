export function sqEuclideanDistance<T>(
  a: T,
  b: T,
  pointExtract: (value: T) => [number, number],
) {
  const ap = pointExtract(a);
  const bp = pointExtract(b);
  const x = bp[0] - ap[0]
  const y = bp[1] - ap[1]
  return x * x + y * y
}

export function euclideanDistance<T>(
  a: T,
  b: T,
  pointExtract: (value: T) => [number, number],
) {
  const ap = pointExtract(a);
  const bp = pointExtract(b);
  const x = bp[0] - ap[0]
  const y = bp[1] - ap[1]
  return Math.sqrt(x * x + y * y)
}
