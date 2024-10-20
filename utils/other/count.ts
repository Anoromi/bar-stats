export function count<V>(values: V[], predicate: (value: V, index: number) => boolean) {
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    if (predicate(values[i], i)) {
      count++;
    }
  }
  return count;
}
