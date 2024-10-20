

export function max<V>(values: V[], compare: (a: V, b: V) => number) {
  if (values.length === 0)
    return null;

  let max = values[0]
  for (let i = 1; i < values.length; i++) {
    if(compare(max, values[i]) < 0)
      max = values[i]
  }

  return max
}

export function min<T>(array: T[], compare: (value: T, to: T) => number) {
  if (array.length === 0) return null;
  let max = array[0];
  for (const v of array) {
    if (compare(v, max) < 0) max = v;
  }
  return max;
}
