<script setup lang="tsx">
import type { VChart } from "#build/components";
import { debouncedRef, useElementSize } from "@vueuse/core";
import type { LineSeriesOption } from "echarts/charts";
import { MovingAverageOptions } from "~/rstar/pkg/bar_stats_wasm";
import type { ValueToTimeMapping } from "~/utils/battleProcessor/osToTime";
import { assert } from "~/utils/other/assert";
import {
  getUniformColorBlue,
  getUniformColorRed,
} from "~/utils/other/uniformColor";

const props = defineProps<{
  title: string;
  data: ValueToTimeMapping;
  xLabel: string;
  teamWinData?: ValueToTimeMapping[];
  min?: number;
  max?: number;
}>();

const divElement = useTemplateRef<HTMLElement>("div");
const size = useElementSize(divElement);

const id = useId();
const { worker: smoothingWorker } = useWorkerServers().smoothingWorker;

const allowedMovingAverages = [
  { key: "sma", value: "Simple moving average" },
  { key: "smm", value: "Simple moving median" },
  { key: "ema", value: "Exponential moving average" },
  { key: "wsma", value: "Wilder's moving average moving average" },
] as const;

const movingAverageType =
  ref<(typeof allowedMovingAverages)[number]["key"]>("sma");

function translateAverageOption(
  value: (typeof allowedMovingAverages)[number]["key"],
) {
  switch (value) {
    case "sma":
      return MovingAverageOptions.SMA;
    case "smm":
      return MovingAverageOptions.SMM;
    case "ema":
      return MovingAverageOptions.EMA;
    case "wsma":
      return MovingAverageOptions.WSMA;
  }
}

const roughnessFactor = ref([10]);
const debouncedSmoothnessFactor = debouncedRef(roughnessFactor, 50);

const { data: smoothedValues } = useAsyncData(
  id,
  async () => {
    const [mainData, ...teamWinData] = await Promise.all([
      smoothingWorker.value!.request({
        type: "process",
        data: {
          smoothingLength:
            props.data.times.length / debouncedSmoothnessFactor.value[0],
          smoothingOption: translateAverageOption(movingAverageType.value),
          mapping: toRaw(props.data),
        },
      }),
      ...(props.teamWinData?.map((v) =>
        smoothingWorker.value!.request({
          type: "process",
          data: {
            smoothingLength:
              props.data.times.length / debouncedSmoothnessFactor.value[0],
            smoothingOption: translateAverageOption(movingAverageType.value),
            mapping: toRaw(v),
          },
        }),
      ) ?? []),
    ]);
    assert(mainData.type === "process");

    return {
      mainData: mainData.data.smoothedData,
      teamWinData: teamWinData.map((v) => v.data),
    };
  },
  {
    server: false,
    watch: [
      smoothingWorker,
      () => props.data,
      debouncedSmoothnessFactor,
      movingAverageType,
    ],
  },
);

const teamWinLabels = computed(() => {
  if (props.teamWinData === undefined) return [];
  if (props.teamWinData.length === 2) {
    const arrs: string[] = [];
    arrs[0] = "Blue wins";
    arrs[1] = "Red wins";
    return arrs;
  }
  return props.teamWinData.map((_, i) => `Team ${i + 1} win`);
});

const option = computed<ECOption | null>(() => {
  if (size.width.value === 0) return null;
  const values: [number, number][] = [];
  const teamValues: LineSeriesOption[] =
    props.teamWinData !== undefined
      ? Array(props.teamWinData.length)
        .fill(0)
        .map((_, i) => {
          let color = undefined;
          if (i === 1) {
            color = getUniformColorRed(0);
          } else if (i === 0) {
            color = getUniformColorBlue(0);
          }

          return {
            data: [] as [number, number][],
            name: teamWinLabels.value[i],
            type: "line",
            color: color,
            emphasis: {},
            itemStyle: {
              borderRadius: [8, 8, 0, 0],
            },
            showSymbol: false,
          } as const;
        })
      : [];

  //const legendLabels = ["All"].concat(...( props.teamWinData?.map(v => v) ?? [] ))

  return {
    grid: {
      bottom: 20,
      left: 50,
      right: 100,
    },
    xAxis: {
      type: "value",
      name: props.xLabel,
    },
    yAxis: {
      type: "value",
      name: "time",
      //min: props.min,
      //max: props.max
    },
    legend: {
      orient: "vertical",
      right: 10,
      data: ["All"].concat(teamWinLabels.value),
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        snap: true,
      },
    },
    series: [
      {
        data: values,
        type: "line",
        name: "All",
        emphasis: {},
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
        },
        showSymbol: false,
      },
      ...teamValues,
    ],
  };
});

const chart = useTemplateRef<InstanceType<typeof VChart>>("chart");
const { theme } = useEChartThemes();

watch(
  () => [smoothedValues.value, option.value, theme.value] as const,
  ([newData]) => {
    if (newData === null) return;
    chart.value!.chart!.setOption({
      series: [
        {
          data: newData?.mainData ?? [],
        },
      ].concat(
        newData?.teamWinData.map((v) => ({
          data: v.smoothedData,
        })) ?? [],
      ),
    });
  },
);
</script>

<template>
  <div ref="div" class="w-full pb-8">
    <h4 class="h-9 px-4 pt-2 text-xl font-bold">
      {{ props.title }}
      <slot name="hint" />
    </h4>
    <div class="mb-8 mt-4 flex flex-col gap-2 px-4">
      <div class="flex flex-col">
        <b class="pb-2">Roughness factor</b>
        <Slider v-model="roughnessFactor" :max="60" :min="1" :step="0.5" />
        <div class="flex justify-end">
          <span class="mt-1 text-foreground-variant">Factor {{ roughnessFactor[0] }}</span>
        </div>
      </div>
      <Select v-model="movingAverageType" class="flex-1">
        <SelectTrigger>
          <SelectValue placeholder="Moving average type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Moving average type</SelectLabel>
            <SelectItem v-for="v in allowedMovingAverages" :key="v.key" :value="v.key">
              {{ v.value }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <VChart v-if="option !== null" ref="chart" :option="option" :theme="theme" :init-options="{ height: 500 }"
      class="h-[500px] w-full"></VChart>
  </div>
</template>
