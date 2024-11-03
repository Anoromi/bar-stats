<script setup lang="ts">
import { useElementSize } from "@vueuse/core";

const { data, title } = defineProps<{
  data: Record<string, number>;
  title: string;
}>();

const factionWinrate = computed(() => {
  const winrate = data;
  return Object.keys(winrate)
    .map((faction) => {
      return { name: faction, ratio: winrate[faction] };
    })
    .filter((v) => v.name !== "Random");
});

function getFactionName(name: string) {
  switch (name) {
    case "Armada":
      return "Armada";
    case "Cortex":
      return "Cortex";
    case "Unknown":
      return "Legion";
    default:
      throw new Error("Weird faction name " + name);
  }
}

const divElement = useTemplateRef<HTMLElement>("div");
const size = useElementSize(divElement);

const option = computed<ECOption>(() => {
  const colors = factionWinrate.value.map((v) => {
    switch (v.name) {
      case "Armada":
        return "blue";
      case "Cortex":
        return "red";
      case "Unknown":
        return "green";
      default:
        throw new Error("Weird faction name " + v.name);
    }
  });

  return {
    xAxis: {
      type: "category",
      data: factionWinrate.value.map((v) => getFactionName(v.name)),
    },
    yAxis: {
      type: "value",
    },
    tooltip: {},
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: "Save as image",
          name: title,
        },
        dataView: {
          show: true,
          title: "Data View",
          readOnly: true,
        },
      },
    },
    series: [
      {
        data: factionWinrate.value.map((v) => v.ratio),
        type: "bar",
        color: colors,
        colorBy: "data",
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              show: true,
              title: "Save as image",
              name: "Team winrate",
            },
            dataView: {
              show: true,
              title: "Data View",
              readOnly: true,
            },
          },
        },
        tooltip: {
          valueFormatter: (value) => {
            if (Array.isArray(value)) {
              return value
                .map((v) => {
                  const vNumber = v as number;
                  if (vNumber % 1 === 0) {
                    return vNumber.toString();
                  }
                  return (vNumber as number).toFixed(4);
                })
                .join(", ");
            }
            const vNumber = value as number;
            if (vNumber % 1 === 0) {
              return vNumber.toString();
            }
            return (vNumber as number).toFixed(4);
          },
        },
      },
    ],
  };
});
const { theme } = useEChartThemes();
</script>

<template>
  <div ref="div" class="w-full">
    <h4 class="px-4 pt-2 text-xl font-bold">{{ title }}</h4>
    <VChart
      ref="winrate-canvas"
      :option="option"
      :init-options="{
        height: 400,
        width: size.width.value,
      }"
      :theme="theme"
      class="h-[400px] w-full"
    ></VChart>
  </div>
</template>
