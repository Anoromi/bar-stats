<script setup lang="ts">
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
import Hint from "../ui/hint/Hint.vue";

const props = defineProps<{
  battles: BattleWithPlayers[];
  playerClusters: LabeledPlayer[];
  map: {
    name: string;
    width: number;
    height: number;
  };
  positionPreference: number[];
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

  const labelCopy = [...map.entries()].filter((v) => v[0] !== 0);

  labelCopy.sort((a, b) => b[1].length - a[1].length);
  return labelCopy;
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

const clusteredPointsData = computed(() => {
  return labels.value.map((label) => {
    const point = avgPoint(label[1], ([playerIndex, battleIndex]) => {
      const player = props.battles[battleIndex].values[playerIndex];
      return [player.startPosX!, player.startPosZ!];
    });
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
  const series = [...clusteredPointsData.value.entries()];
  const center = [
    mapHalfSize.value.width / 2,
    mapHalfSize.value.height / 2,
  ] as const satisfies unknown[];

  series.sort(([_, a], [_2, b]) => {
    const aDist = sqEuclideanDistance(a.position, center, (v) => v);
    const bDist = sqEuclideanDistance(b.position, center, (v) => v);
    return aDist - bDist;
  });

  for (const [index, { labelId: labelValue, teamNumber }] of series) {
    if (teamNumber === 1) {
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
  return colors;
});

const options = computed<ECOption>(() => {
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
      roam: !showInFull.value,
      left: "24px",
      right: "24px",
      top: "24px",
      bottom: "24px",
    },
    tooltip: {},
    series: [
      ...clusteredPointsData.value.map((series, i) => {
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
                    Color ${labelColors.value[i][1]} <br>
                    Preference ${props.positionPreference[labelId].toPrecision(4)}`;
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
            textBorderWidth: 1,
            fontWeight: 800,
            fontSize: 20,
            position: "insideBottom",
            distance: 20,
            color: "#fff",
          },
          itemStyle: {
            borderType: "solid",
            borderColor: "#000",
            borderWidth: 1,
          },
          z: 20,
          zlevel: 10,
        } satisfies ScatterSeriesOption;
      }),

      ...labels.value.map((label, i) => {
        const points = label[1]
          .map(([playerIndex, battleIndex]) => {
            const player = props.battles[battleIndex].values[playerIndex];
            return [
              player.startPosX!,
              player.startPosZ!,
            ] as const satisfies unknown[];
          })
          .slice(0, 100);
        return {
          type: "scatter",
          color: labelColors.value[i][0],
          coordinateSystem: "geo",
          data: points,
          symbolSize: 6,
          tooltip: {
            show: false,
          },
          select: {
            disabled: true,
          },
          itemStyle: {
            borderType: "solid",
            borderColor: "#000",
            borderWidth: 0.5,
          },
          z: 10,
          zlevel: 0,
        } satisfies ScatterSeriesOption;
      }),
    ],
  };
});

const chartRef = useTemplateRef<InstanceType<typeof VChart>>("chart-ref");

const showInFull = ref(false);

watchEffect((dispose) => {
  if (import.meta.client) {
    const query = window.matchMedia("(min-width: 600px)");
    const listener = (result: MediaQueryListEvent) => {
      showInFull.value = result.matches;
    };
    showInFull.value = query.matches;
    query.addEventListener("change", listener);
    dispose(() => {
      query.removeEventListener("change", listener);
    });
  }
});

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
        teamCount: toRaw(props.maxTeams),
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
    assert(result.type === "evaluate");
    return result.data;
  },
  {
    server: false,
    watch: [labels, selectedColors, initialized],
  },
);

function updateSelectedColors(event: SelectChangedPayload) {
  //console.log("selected", event);
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
        :class="
          cn(
            'w-full shrink-0 overflow-clip rounded-xl bg-surface outline outline-1 outline-foreground/30',
            {
              'w-[500px]': showInFull,
            },
          )
        "
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
            <b>No positions selected </b>
            <Hint>
              To select a datapoint press on one of the positions on the map
            </Hint>
          </div>
        </div>
        <div
          v-if="clusterData !== null && selectedColors.length > 0"
          class="mt-4 text-lg"
        >
          <p><b>Point count:</b> {{ clusterData.pointCount }}</p>
          <p>
            <b>Position preference:</b>
            {{ clusterData.positionPreference.toFixed(3) }}
          </p>
        </div>
      </div>
    </div>
    <template v-if="clusterData !== null">
      <Tabs default-value="winrate" class="mt-4">
        <TabsList>
          <TabsTrigger value="winrate"> Winrates </TabsTrigger>
          <TabsTrigger value="combined os"> Combined os </TabsTrigger>
          <TabsTrigger value="team os"> Red - Blue os </TabsTrigger>
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
            :data="clusterData.osToTime.data"
            :team-win-data="clusterData.osToTime.teamWins"
            title="Combined position os to time"
            x-label="combined os"
          >
            <template #hint>
              <Hint>
                This chart reflects on how summed up os of selected players
                corresponds to battle time. <br />
                <b>For example,</b> for 2 players in a battle we will get
                formula
                <blockquote class="text-foreground-variant">
                  player1_os + player2_os
                </blockquote>
              </Hint>
            </template>
          </OsToTimeChart>
          <OsToTimeChart
            :data="clusterData.osAvgOsDiffToTime.data"
            :team-win-data="clusterData.osAvgOsDiffToTime.teamWins"
            title="Combined os factor to time"
            x-label="combined os"
          >
            <template #hint>
              <Hint class="sm:w-96">
                This chart is similar to combined position os to time. <br />
                However, instead of taking os, this chart uses difference
                between player os and average os in a battle. <br />
                <b>For example,</b> for 2 players in a battle we will get
                formula
                <blockquote class="text-foreground-variant">
                  (player1_os - average_os) + (player2_os - average_os)
                </blockquote>
              </Hint>
            </template>
          </OsToTimeChart>
        </TabsContent>
        <TabsContent value="team os">
          <OsToTimeChart
            :data="clusterData.osTeamToTime.data"
            :team-win-data="clusterData.osTeamToTime.teamWins"
            title="Team os difference to time"
            x-label="team os diff"
          >
            <template #hint>
              <Hint class="sm:w-96">
                This chart reflects on how summed up os of players in teams
                corresponds to battle time. <br />
                <b>For example,</b> for 2 players from red team (red,
                orange) and 2 players (blue, green) from blue team in a battle
                we will get formula
                <blockquote class="text-foreground-variant">
                  (red + orange) - (blue + green)
                </blockquote>
              </Hint>
            </template>
          </OsToTimeChart>
          <OsToTimeChart
            :data="clusterData.osTeamAvgOsDiffToTime.data"
            :team-win-data="clusterData.osTeamAvgOsDiffToTime.teamWins"
            title="Team os factor difference to time"
            x-label="Team os diff"
          >
            <template #hint>
              <Hint class="sm:w-96">
                This chart is similar to team position os to time. <br />
                However, instead of taking os, this chart uses difference
                between player os and average os in a battle. <br />
                <b>For example,</b> for 4 players from 2 teams in a battle we
                will get formula
                <blockquote class="text-foreground-variant">
                  ((red - average_os) + (player2_os - average_os)) -
                  ((blue - average_os) + (player4_os - average_os))
                </blockquote>
              </Hint>
            </template>
          </OsToTimeChart>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
