export type Grouped<T, G> = { key: G; values: T[] };
export type Grouped2<T1, T2, G> = { key: G; values: T1[]; values2: T2[] };

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

export function groupByMappedWithMap<T, G, V>(
  values: T[],
  {
    getMappableKey,
    selectGroupKey,
    selectGroupValue,
  }: {
    getMappableKey: (group: G) => unknown;
    selectGroupKey: (value: T) => G;
    selectGroupValue: (value: T) => V;
  },
): Grouped<V, G>[] {
  const map = new Map<unknown, T[]>();

  for (const value of values) {
    const key = getMappableKey(selectGroupKey(value));
    let arr = map.get(key);
    if (arr === undefined) {
      arr = [value];
      map.set(key, arr);
    } else {
      arr.push(value);
    }
  }
  const groups: Grouped<V, G>[] = [];

  for (const [_, grouped] of map) {
    groups.push({
      key: selectGroupKey(grouped[0]),
      values: grouped.map((v) => selectGroupValue(v)),
    });
  }

  return groups as Grouped<V, G>[];
}

export function group2ByMappedWithMap<T, G, V, V2>(
  values: T[],
  {
    getMappableKey,
    selectGroupKey,
    selectGroupValue,
    selectGroupValue2,
  }: {
    getMappableKey: (group: G) => unknown;
    selectGroupKey: (value: T) => G;
    selectGroupValue: (value: T) => V;
    selectGroupValue2: (value: T) => V2;
  },
): Grouped2<V, V2, G>[] {
  const map1 = new Map<unknown, T[]>();
  const map2 = new Map<unknown, V2[]>();

  for (const value of values) {
    const key = getMappableKey(selectGroupKey(value));
    {
      let arr = map1.get(key);
      if (arr === undefined) {
        arr = [value];
        map1.set(key, arr);
      } else {
        arr.push(value);
      }
    }
    {
      let arr = map2.get(key);
      if (arr === undefined) {
        arr = [selectGroupValue2(value)];
        map2.set(key, arr);
      } else {
        arr.push(selectGroupValue2(value));
      }
    }
  }
  const groups: Grouped2<V, V2, G>[] = [];

  for (const [key, grouped] of map1) {
    const v2 = map2.get(key)
    groups.push({
      key: selectGroupKey(grouped[0]),
      values: grouped.map((v) => selectGroupValue(v)),
      values2: v2 ?? [],
    });
  }

  return groups as Grouped2<V, V2, G>[];
}
