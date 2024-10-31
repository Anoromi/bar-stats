<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import {
  getUniformColorBlue,
  getUniformColorRed,
} from "~/utils/other/uniformColor";

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
      data: factionWinrate.value.map((v) => `Team ${v.name + 1}`),
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: factionWinrate.value.map((v) => v.ratio),
        type: "bar",
        color: factionWinrate.value.map((_v, i) => {
          if (i === 0) {
            return getUniformColorBlue(i)[0];
          } else if (i === 1) {
            return getUniformColorRed(i)[0];
          }
          return getUniformColorRed(i)[0];
        }),
        colorBy: "data",
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };
});
const divElement = useTemplateRef<HTMLElement>("div");
const size = useElementSize(divElement);

const { theme } = useEChartThemes();
</script>
<template>
  <div ref="div">
    <h4 class="px-4 pt-2 text-xl font-bold">Team win rate</h4>
    <VChart ref="winrate-canvas" :option="option" :init-options="{
      height: 400,
      width: size.width.value
    }" :theme="theme" class="h-[400px]"></VChart>
  </div>
</template>
