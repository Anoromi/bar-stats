<script setup lang="tsx">
import { useElementSize } from "@vueuse/core";

const props = defineProps<{
  title: string;
  data: [os: number, time: number][];
  xLabel: string;
  min?: number,
  max?: number
}>();

const divElement = useTemplateRef<HTMLElement>("div");
const size = useElementSize(divElement);

const option = computed<ECOption | null>(() => {
  if (size.width.value === 0) return null;
  return {
    title: {
      text: props.title,
    },
    xAxis: {
      type: "value",
      name: props.xLabel,
    },
    yAxis: {
      type: "value",
      name: "time",
      min: props.min,
      max: props.max
    },
    series: [
      {
        data: props.data,
        type: "line",
        //color: ["red", "blue"],
        //colorBy: "data",
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
        showSymbol: false,
      },
    ],
  };
});
</script>

<template>
  <div ref="div" class="h-[600px] w-full">
    <VChart v-if="option !== null" :option="option" :init-options="{ height: 600 }" class="h-[600px]"></VChart>
  </div>
</template>
