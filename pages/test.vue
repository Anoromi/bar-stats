<script setup lang="ts">
import type { ScatterSeriesOption } from 'echarts/charts';
import { densityClusterize } from '~/utils/battleProcessor/clusterize';

const clusters = shallowRef<[number, number][][]>()

const options = computed<ECOption>(() => ({
  tooltip: {
    position: 'top'
  },
  grid: {
    left: 120
  },
  xAxis: {},
  yAxis: {},
  series: clusters.value?.map(v => ({
    type: 'scatter',
    data: v
  }) as ScatterSeriesOption) ?? []
}))


onNuxtReady(async () => {

  const data = [
    ...clump([10, 1000], 10, [10, 10]),
    ...clump([1000, 10], 10, [10, 10]),
    ...clump([1000, 100], 10, [10, 10]),
    ...clump([1000, 1000], 10, [10, 10]),
    ...clump([1300, 1000], 10, [10, 10]),
  ]


  const { data: clusterizationResult, clusterCount } = await densityClusterize(data, (value) => ({ x: value[0], y: value[1], battleIndex: 0 }), 500, 5, 3,)

  const arr: [number, number][][] = []

  for (let i = 0; i < clusterizationResult.length; i++) {
    arr[clusterizationResult[i]] ??= []
    arr[clusterizationResult[i]].push(data[i])
  }

  console.log(arr)
  clusters.value = arr


});

function* clump(position: [number, number], size: number, displacement: [number, number]) {
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      yield [position[0] + i * displacement[0], position[1] + j * displacement[1]] as [number, number]
    }
  }
  return
}


</script>
<template>
  <div>
    Hello there
    <VChart :option="options" :init-options="{
      height: 1000,
      width: 1000
    }"></VChart>
  </div>
</template>
