<script setup lang="tsx">
import { registerMap } from "echarts";
import type { ScatterSeriesOption } from "echarts/charts";
import type { ElementEvent } from "echarts/core";
import { cn } from "~/lib/utils";
import type { BattleWithPlayers } from "~/server/utils/services/battleService";
import {
  extractPlayer,
  type LabeledPlayer,
} from "~/utils/battleProcessor/labeledPlayers";
import type {
  ClusterPostprocessingRequest,
  ClusterPostprocessingResult,
} from "~/utils/mapClusters/worker";
import { avgPoint } from "~/utils/other/avgPoint";
import MapClusterWorker from "~/utils/mapClusters/worker?worker";

import {
  getAnyUniformColor,
  getUniformColorBlue,
  getUniformColorRed,
  type NamedColor,
} from "~/utils/other/uniformColor";
import { useClientWorker } from "~/utils/worker/useClientWorker";
import { assert } from "~/utils/other/assert";

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
  console.log("filtered", filteredLabels);
  filteredLabels.sort((a, b) => b[1].length - a[1].length);
  return filteredLabels;
});

const mapAspectRatio = computed(() => {
  return props.map.width / props.map.height;
});

const labelColors = computed(() => {
  if (props.maxTeams > 2) {
    return labels.value.map((labelValue, i) => [...getAnyUniformColor(i), labelValue[0]] as const satisfies unknown[]);
  }
  const colors: [string, string, number][] = [];
  const teamCounts = Array(props.maxTeams).fill(0);
  for (const [labelValue, players] of labels.value) {
    const player = extractPlayer(props.battles, players[0]);
    if (player.battleTeamNumber === 0) {
      colors.push([...getUniformColorRed(teamCounts[player.battleTeamNumber]), labelValue]);
    } else {
      colors.push([...getUniformColorBlue(teamCounts[player.battleTeamNumber]), labelValue]);
    }
    teamCounts[player.battleTeamNumber]++;
  }
  return colors;
});

watchEffect(() => {
  const href = `https://api.bar-rts.com/maps/${props.map.name}/texture-mq.jpg`;
  const width = props.map.width * 512;
  const height = props.map.height * 512;

  registerMap(props.map.name, {
    svg: `<svg viewBox="${0} ${0} ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><image href="${href}" width="${width}" height="${height}" x="${0}" y="${0}"/></svg>`,
  });
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
    series: labels.value.map((v, labelIndex) => {
      const pointCenter = avgPoint(v[1], ([playerIndex, battleIndex]) => {
        const player = props.battles[battleIndex].values[playerIndex];
        return [player.startPosX!, player.startPosZ!];
      });
      return {
        coordinateSystem: "geo",
        symbolSize: [20, 20],
        type: "scatter",
        data: [[pointCenter[0], pointCenter[1], labelIndex]],
        //data: v[1]
        //  .map(([playerIndex, battleIndex]) => {
        //    const p = props.battles[battleIndex].values[playerIndex];
        //    return [p.startPosX!, p.startPosZ!, labelIndex];
        //  })
        //  .slice(0, 100),
        color: labelColors.value[labelIndex][0],
        tooltip: {
          formatter: () => {
            return `Found ${v[1].length} points <br>
                    Data ${labelColors.value[labelIndex][1]}
            `;
          },
        },

        label: {
          show: true,
          formatter: function () {
            return labelColors.value[labelIndex][1];
          },
          textBorderColor: "#000",
          textBorderWidth: 1.5,
          fontWeight: 800,
          fontSize: 20,
          position: "insideBottom",
          distance: 20,
          color: labelColors.value[labelIndex][0],
        },
        itemStyle: {
          borderType: "solid",
          borderColor: "#000",
          borderWidth: 1,
        },
      } as ScatterSeriesOption;
    }),
  };
});

const selectedColors = ref<number[]>([0]);
function switchColor(index: number) {
  if (selectedColors.value.includes(index)) {
    selectedColors.value = selectedColors.value.filter((v) => v != index);
  } else {
    selectedColors.value = selectedColors.value.concat(index);
  }
}

const { worker } = useClientWorker<
  ClusterPostprocessingRequest,
  ClusterPostprocessingResult
>(() => new MapClusterWorker());

const initialized = ref(false);
watch(
  labels,
  async () => {
    initialized.value = false;
    console.log("initing");

    await worker.value!.request({
      type: "init",
      params: {
        battles: toRaw(props.battles),
        labeledPlayers: toRaw(props.playerClusters),
        labelCount: toRaw(props.clusterCount),
      },
    });
    console.log("inited");
    initialized.value = true;
  },
  {
    immediate: true,
  },
);
//const initialized = computedAsync(() => {
//worker.value?.request
//})

const { data: clusterData, status: clusterStatus } = useAsyncData(
  async () => {
    if (!initialized.value) {
      return null;
    }
    console.log("trying to evaluate");
    const result = await worker.value!.request({
      type: "evaluate",
      params: {
        labels: toRaw(selectedColors.value).map(v => labelColors.value[v][2]!),
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

function testClick(k: ElementEvent) {
  console.log(k.target.getState("y"));
  console.log(k);
}
</script>
<template>
  <div class="flex flex-col lg:flex-row lg:gap-x-5">
    <VChart
      v-memo="[options]"
      :option="options"
      :init-options="{
        height: 500 / mapAspectRatio,
        width: 500,
      }"
      class="w-[500px] shrink-0 rounded-xl bg-surface outline outline-1 outline-foreground/30"
      @zr:click="testClick"
    />
    <div class="flex flex-col">
      <div class="flex h-fit flex-wrap items-start justify-start gap-2 pt-6">
        <Button
          v-for="(color, i) in labelColors"
          :key="color[0]"
          variant="destructive"
          :class="
            cn('mb-auto box-border flex gap-x-1', {
              'bg-surface outline outline-1 outline-primary':
                selectedColors.includes(i),
            })
          "
          @click="() => switchColor(i)"
        >
          <div
            class="h-4 w-4 rounded-full"
            :style="{ 'background-color': color[0] }"
          ></div>
          {{ color[1] }}
        </Button>
      </div>
      <div class="mt-10">
        <p>Point count {{ clusterData?.pointCount }}</p>
        <p>Preference {{ clusterData?.positionPreference }}</p>
      </div>
    </div>
  </div>
</template>
