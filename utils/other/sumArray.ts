export function sumArray(values: number[]) {
  let counter = 0;
  for (const v of values) {
    counter += v;
  }
  return counter
}
