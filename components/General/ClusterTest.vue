<script setup lang="tsx">
import { depthClusterize } from "~/utils/battleProcessor/clusterize";
import { KDTree } from "~/utils/other/kdtree";

const points = shallowRef<[number, number][]>([]);

onNuxtReady(() => {
  points.value = [
    [0, 0],
    [1, 1],
    [1, 2],

    [5, 5],

    [10, 10],
    [11, 11],
    [11, 12],
  ];
  if (import.meta.client) {
    import("~/rstar/pkg/rstar").then((v) => {
      v.greet();
    });
  }

  const tree = new KDTree(points.value, (v) => v);
  console.log(
    "rangeSearch",
    tree.rangeSearch([5, 5], 5, (a, b) => false),
  );
});

const clustered = computed<[number, number][][]>(() => {
  const { data: labels, clusterCount } = depthClusterize(
    points.value,
    (v) => v,
    //(a, b) => {
    //  const x = b[0] - a[0];
    //  const y = b[1] - a[1];
    //  return Math.sqrt(x * x + y * y);
    //},
    6,
    0,
  );

  const result: [number, number][][] = [];
  for (let i = 0; i < clusterCount; i++) {
    const cluster: [number, number][] = [];
    for (let j = 0; j < labels.length; j++) {
      if (labels[j] === i) {
        cluster.push(points.value[j]);
      }
    }
    result.push(cluster);
  }

  return result;
});

const options = computed<ECOption>(() => {
  return {
    title: {
      text: "Hello there",
    },
    xAxis: {},
    yAxis: {
      type: "value",
    },
    series: clustered.value.map((cluster) => {
      return {
        type: "scatter",
        data: cluster,
      };
    }),
  };
});

watchEffect(() => {
  console.log(options.value);
});
</script>
<template>
  <div>
    <LazyVChart :option="options" class="h-[400px]"></LazyVChart>
  </div>
</template>
