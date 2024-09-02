export type Grouped<T, G> = { key: G; values: T[] };

export function groupBy<T, G>(
  values: T[],
  opts: {
    inGroup: (value: T, group: G) => boolean;
    selectGroupKey: (value: T) => G;
  },
) {
  return groupByMapped(values, { ...opts, selectGroupValue: (v) => v });
}

export function groupByMapped<T, G, V>(
  values: T[],
  {
    inGroup,
    selectGroupKey,
    selectGroupValue,
  }: {
    inGroup: (value: T, group: G) => boolean;
    selectGroupKey: (value: T) => G;
    selectGroupValue: (value: T) => V;
  },
): Grouped<V, G>[] {
  const groups: Grouped<unknown, G>[] = [];
  for (const value of values) {
    let foundGroup = false;
    for (const group of groups) {
      if (inGroup(value, group.key)) {
        foundGroup = true;
        group.values.push();
        break;
      }
    }
    if (!foundGroup) {
      groups.push({
        key: selectGroupKey(value),
        values: [selectGroupValue(value)],
      });
    }
  }
  return groups as Grouped<V, G>[];
}
