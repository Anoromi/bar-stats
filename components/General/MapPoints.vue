<script setup lang="tsx">
import { registerMap } from "echarts";
import type { ScatterSeriesOption } from "echarts/charts";
import { cn } from "~/lib/utils";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import {
  extractPlayer,
  type LabeledPlayer,
} from "~/utils/battleProcessor/labeledPlayers";

import { avgPoint } from "~/utils/other/avgPoint";

import {
  getAnyUniformColor,
  getUniformColorBlue,
  getUniformColorRed,
} from "~/utils/other/uniformColor";
import { assert } from "~/utils/other/assert";
import type { VChart } from "#build/components";
import { sqEuclideanDistance } from "~/utils/other/euclideanDistance";
import type { SelectChangedPayload } from "echarts/core";
import OsToTimeChart from "./OsToTimeChart.vue";

const props = defineProps<{
  battles: BattleWithPlayers[];
  playerClusters: LabeledPlayer[];
  map: {
    name: string;
    width: number;
    height: number;
  };
  clusterCount: number;
  maxTeams: number;
}>();

const labels = computed(() => {
  const data = props.playerClusters;
  const map = new Map<number, LabeledPlayer[]>();
  for (const entry of data) {
    const arr = map.get(entry[2]) ?? [];
    arr.push(entry);
    map.set(entry[2], arr);
  }

  const maxExpected = Math.max(...[...map.entries()].map((v) => v[1].length));
  const filteredLabels = [...map.entries()].filter(
    (v) => v[1].length > maxExpected / 10,
  );
  filteredLabels.sort((a, b) => b[1].length - a[1].length);
  return filteredLabels;
});

const mapAspectRatio = computed(() => {
  return props.map.width / props.map.height;
});

const mapHalfSize = computed(() => {
  const width = props.map.width * 512;
  const height = props.map.height * 512;
  return { width, height };
});

watchEffect(() => {
  const href = `https://api.bar-rts.com/maps/${props.map.name}/texture-mq.jpg`;
  const { width, height } = mapHalfSize.value;

  registerMap(props.map.name, {
    svg: `<svg viewBox="${0} ${0} ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><image href="${href}" width="${width}" height="${height}" x="${0}" y="${0}"/></svg>`,
  });
});

const seriesData = computed(() => {
  return labels.value.map((label) => {
    const point = avgPoint(label[1], ([playerIndex, battleIndex]) => {
      const player = props.battles[battleIndex].values[playerIndex];
      return [player.startPosX!, player.startPosZ!];
    });
    //console.log('extracted', label[1].map(v => extractPlayer(props.battles, v).battleTeamNumber))
    //console.assert(label[1].map(v => extractPlayer(props.battles, v).battleTeamNumber).length === 1, "Oh no")
    //console.log(label[1].filter(v => extractPlayer(props.battles, v).battleTeamNumber).length === 1, "Oh no")
    return {
      position: point,
      labelId: label[0],
      pointCount: label[1].length,
      teamNumber: extractPlayer(props.battles, label[1][0]).battleTeamNumber,
    };
  });
});

const labelColors = computed(() => {
  if (props.maxTeams > 2) {
    return labels.value.map(
      (labelValue, i) =>
        [...getAnyUniformColor(i), labelValue[0]] as const satisfies unknown[],
    );
  }
  const colors: [string, string, number][] = [];
  const teamIndex = Array(props.maxTeams).fill(0);
  const series = [...seriesData.value.entries()];
  const center = [
    //0, 0,
    mapHalfSize.value.width / 2,
    mapHalfSize.value.height / 2,
  ] as const satisfies unknown[];

  series.sort(([_, a], [_2, b]) => {
    const aDist = sqEuclideanDistance(a.position, center, (v) => v);
    const bDist = sqEuclideanDistance(b.position, center, (v) => v);
    return aDist - bDist;
  });

  console.log("series", series);
  for (const [index, { labelId: labelValue, teamNumber }] of series) {
    if (teamNumber === 0) {
      colors[index] = [
        ...getUniformColorRed(teamIndex[teamNumber]),
        labelValue,
      ];
    } else {
      colors[index] = [
        ...getUniformColorBlue(teamIndex[teamNumber]),
        labelValue,
      ];
    }
    teamIndex[teamNumber]++;
  }
  console.log("colors", colors);
  return colors;
});

const options = computed<ECOption>(() => {
  console.log("labels", labels.value);
  return {
    xAxis: {
      show: false,
    },
    yAxis: {
      show: false,
    },
    grid: {
      show: false,
    },

    geo: {
      map: props.map.name,
      roam: false,
      left: "24px",
      right: "24px",
      top: "24px",
      bottom: "24px",
    },
    tooltip: {
      //show: true,
      //triggerOn: "none",
      //formatter: (v) => {
      //  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //  const data = (v as any).data;
      //  console.log('data', data)
      //  return '' + data[1];
      //},
    },

    //tooltip: {
    //  show: true,
    //  formatter: (params) => {
    //  const p = params.data
    //    //params
    //    //return labelColors.value[labelIndex][1];
    //  },
    //},
    series: seriesData.value.map((series, i) => {
      const { position, labelId, pointCount } = series;
      return {
        name: labelColors.value[i][1],
        coordinateSystem: "geo",
        symbolSize: [20, 20],
        type: "scatter",
        selectedMode: "series",

        data: [[position[0], position[1], labelId]],
        color: labelColors.value[i][0],
        tooltip: {
          formatter: () => {
            return `Found ${pointCount} points <br>
                    Color ${labelColors.value[i][1]}`;
          },
        },
        select: {
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 3,
          },
        },
        label: {
          show: true,
          formatter: function () {
            return labelColors.value[i][1];
          },
          textBorderColor: "#000",
          textBorderWidth: 1.5,
          fontWeight: 800,
          fontSize: 20,
          position: "insideBottom",
          distance: 20,
          color: labelColors.value[i][0],
        },
        itemStyle: {
          borderType: "solid",
          borderColor: "#000",
          borderWidth: 1,
        },
      } as ScatterSeriesOption;
    }),
    //series: labels.value.map((v, labelIndex) => {
    //  const pointCenter = avgPoint(v[1], ([playerIndex, battleIndex]) => {
    //    const player = props.battles[battleIndex].values[playerIndex];
    //    return [player.startPosX!, player.startPosZ!];
    //  });
    //  return {
    //    name: labelColors.value[labelIndex][1],
    //    coordinateSystem: "geo",
    //    symbolSize: [20, 20],
    //    type: "scatter",
    //    selectedMode: "series",

    //    data: [[pointCenter[0], pointCenter[1], labelIndex]],
    //    color: labelColors.value[labelIndex][0],
    //    tooltip: {
    //      formatter: () => {
    //        return `Found ${v[1].length} points <br>
    //                Data ${labelColors.value[labelIndex][1]}
    //        `;
    //      },
    //    },
    //    emphasis: {
    //      focus: "self",
    //    },
    //    select: {
    //      itemStyle: {
    //        borderColor: "#fff",
    //        borderWidth: 3,
    //      },
    //    },
    //    label: {
    //      show: true,
    //      formatter: function () {
    //        return labelColors.value[labelIndex][1];
    //      },
    //      textBorderColor: "#000",
    //      textBorderWidth: 1.5,
    //      fontWeight: 800,
    //      fontSize: 20,
    //      position: "insideBottom",
    //      distance: 20,
    //      color: labelColors.value[labelIndex][0],
    //    },
    //    itemStyle: {
    //      borderType: "solid",
    //      borderColor: "#000",
    //      borderWidth: 1,
    //    },
    //  } as ScatterSeriesOption;
    //}),
  };
});

const chartRef = useTemplateRef<InstanceType<typeof VChart>>("chart-ref");

const selectedColors = ref<
  {
    seriesIndex: number;
    dataIndex: number[];
  }[]
>([]);

function deselectColor(index: number) {
  const removedItem = selectedColors.value[index];
  chartRef.value!.chart?.dispatchAction({
    type: "unselect",
    seriesIndex: removedItem.seriesIndex,
    dataIndex: removedItem.dataIndex[0],
  });
}

const { worker } = useWorkerServers().mapProcessingWorker;

const initialized = ref(false);
watch(
  labels,
  async () => {
    initialized.value = false;

    await worker.value!.request({
      type: "init",
      params: {
        battles: toRaw(props.battles),
        labeledPlayers: toRaw(props.playerClusters),
        labelCount: toRaw(props.clusterCount),
      },
    });
    initialized.value = true;
  },
  {
    immediate: true,
  },
);

const id = useId();

const { data: clusterData } = useAsyncData(
  id,
  async () => {
    if (!initialized.value) {
      return null;
    }
    const result = await worker.value!.request({
      type: "evaluate",
      params: {
        labels: toRaw(selectedColors.value).map(
          (v) => labelColors.value[v.seriesIndex][2]!,
        ),
      },
    });
    console.log("map results", result);
    assert(result.type === "evaluate");
    return result.data;
  },
  {
    server: false,
    watch: [labels, selectedColors, initialized],
  },
);

function updateSelectedColors(event: SelectChangedPayload) {
  selectedColors.value = event.selected;
}
</script>
<template>
  <div class="flex flex-col rounded-xl bg-surface p-4 shadow-lg">
    <h4 class="px-4 pt-2 text-xl font-bold">Map data</h4>
    <div class="mt-4 flex flex-col lg:flex-row lg:gap-x-5">
      <VChart
        ref="chart-ref"
        v-memo="[options]"
        :option="options"
        :init-options="{
          height: 500 / mapAspectRatio,
          width: 500,
        }"
        class="w-[500px] shrink-0 rounded-xl bg-surface outline outline-1 outline-foreground/30"
        @selectchanged="updateSelectedColors"
      />
      <div class="flex flex-col">
        <div class="flex h-fit flex-wrap items-start justify-start gap-2 pt-6">
          <Button
            v-for="(color, i) in selectedColors"
            :key="labelColors[color.seriesIndex][0]"
            variant="destructive"
            :class="
              cn('mb-auto box-border flex gap-x-1', {
                'bg-surface outline outline-1 outline-primary':
                  selectedColors.includes(color),
              })
            "
            @click="() => deselectColor(i)"
          >
            <div
              class="h-4 w-4 rounded-full"
              :style="{ 'background-color': labelColors[color.seriesIndex][0] }"
            ></div>
            {{ labelColors[color.seriesIndex][1] }}
          </Button>
          <div v-if="selectedColors.length === 0" class="text-lg">
            <b >No positions selected </b> <br>
            <b >Hint: </b> To select a datapoint press on one of the positions
          </div>
        </div>
        <div
          v-if="clusterData !== null && selectedColors.length > 0"
          class="mt-4 text-lg"
        >
          <p><b>Point count:</b> {{ clusterData.pointCount }}</p>
          <p>
            <b>Preference:</b> {{ clusterData.positionPreference.toFixed(3) }}
          </p>
        </div>
      </div>
    </div>
    <template v-if="clusterData !== null">
      <Tabs default-value="winrate" class="mt-4">
        <TabsList>
          <TabsTrigger value="winrate"> Winrates </TabsTrigger>
          <TabsTrigger value="combined os"> Combined os </TabsTrigger>
          <TabsTrigger value="team os"> Team os </TabsTrigger>
        </TabsList>
        <TabsContent value="winrate" class="w-full">
          <GeneralWinrateChart
            v-if="Object.keys(clusterData.factionPreference).length > 0"
            title="Faction preference"
            :data="clusterData.factionPreference"
            class="mt-8"
          />
          <GeneralWinrateChart
            v-if="Object.keys(clusterData.factionWinrate).length > 0"
            title="Faction winrate"
            :data="clusterData.factionWinrate"
            class="mt-8"
          />
        </TabsContent>
        <TabsContent value="combined os">
          <OsToTimeChart
            v-if="clusterData.osToTime.times.length > 0"
            :data="clusterData.osToTime"
            title="Combined position os to time"
            x-label="combined os"
          />
          <OsToTimeChart
            v-if="clusterData.osAvgOsDiffToTime.times.length > 0"
            :data="clusterData.osAvgOsDiffToTime"
            title="Combine os difference"
            x-label="combined os"
          />
        </TabsContent>
        <TabsContent value="team os">
          <OsToTimeChart
            v-if="clusterData.osTeamToTime.times.length > 0"
            :data="clusterData.osTeamToTime"
            title="Team os diff to time"
            x-label="team os diff"
          />
          <OsToTimeChart
            v-if="clusterData.osTeamAvgOsDiffToTime.times.length > 0"
            :data="clusterData.osTeamAvgOsDiffToTime"
            title="Team os difference"
            x-label="team os diff"
          />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
