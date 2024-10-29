<script setup lang="tsx">
import { getUniformColorRed } from "~/utils/other/uniformColor";

const props = defineProps<{
  data: Record<number, number>;
}>();

const factionWinrate = computed(() => {
  const winrate = props.data;
  return Object.keys(winrate)
    .map((name) => {
      return { name: name, ratio: winrate[name as unknown as number] };
    })
    .filter((v) => v.name !== "Random");
});

const option = computed<ECOption>(() => {
  console.log("winrates", factionWinrate.value);
  return {
    xAxis: {
      type: "category",
      data: factionWinrate.value.map((v) => `Team ${v.name}`),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: factionWinrate.value.map((v) => v.ratio),
        type: "bar",
        color: factionWinrate.value.map((_v, i) => getUniformColorRed(i)[0]),
        colorBy: "data",
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };
});
const { theme } = useEChartThemes();
</script>
<template>
  <div>
    <h4 class="px-4 pt-2 text-xl font-bold">Team win rate</h4>
    <VChart
      ref="winrate-canvas"
      :option="option"
      :init-options="{
        height: 400,
      }"
      :theme="theme"
      class="h-[400px]"
    ></VChart>
  </div>
</template>
