<script setup lang="tsx">
import { registerMap } from "echarts";
import type { ScatterSeriesOption } from "echarts/charts";
import type { UserToBattleTeamDto } from "~/server/utils/dto/dto";
import { randColor } from "~/utils/other/randColor";

const props = defineProps<{
  data: [UserToBattleTeamDto, number][];
  map: {
    name: string;
    width: number;
    height: number;
  };
}>();

const labels = computed(() => {
  const data = props.data;
  const map = new Map<number, UserToBattleTeamDto[]>();
  for (const entry of data) {
    const arr = map.get(entry[1]) ?? [];
    arr.push(entry[0]);
    map.set(entry[1], arr);
  }

  return map;
});

watchEffect(() => {
  console.log('m', props.map)
  const href = `https://api.bar-rts.com/maps/${props.map.name}/texture-mq.jpg`;
  const width = props.map.width * 1000 / 2
  const height = props.map.height * 1000 / 2
  registerMap(props.map.name, {
    //svg: 'https://api.bar-rts.com/maps/supreme_isthmus_v1.8/texture-mq.jpg'
    svg: `<svg viewBox="${0} ${0} ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><image href="${href}" width="${width}" height="${height}" x="${0}" y="${0}"/></svg>`,
  });
});
//echarts.registerMap('hehe', {
//svg: 'https://api.bar-rts.com/maps/supreme_isthmus_v1.8/texture-mq.jpg'
//})
const options = computed<ECOption>(() => {
  console.log("labels", labels.value);
  return {
    xAxis: {},
    yAxis: {},
    //graphic: {
    //  type: "image",
    //  style: {
    //    image:
    //      "https://api.bar-rts.com/maps/supreme_isthmus_v1.8/texture-mq.jpg",
    //
    //      height: 800,
    //      x: 0,
    //      y: 0,
    //      width: 800
    //    //x: 0,
    //    //y: 0,
    //    //width: 100,
    //    //height: 100,
    //  },
    //},
    grid: {
      show: false,
      backgroundColor: {
        //image: `https://api.bar-rts.com/maps/supreme_isthmus_v1.8/texture-mq.jpg`,
        //type: 'linear',
        //scaleX: 0.6,
        //scaleY: 0.6
      },
    },
    geo: {
      map: props.map.name,
      roam: false,
    },
    series: [...labels.value.entries()]
      //.filter((v) => v[1].length > 15)
      .map((v) => {
        return {
          coordinateSystem: "geo",
          type: "scatter",
          data: v[1].map((v) => [v.startPosX, v.startPosZ!]),
          color: randColor(),
          itemStyle: {
            borderType: "solid",
            borderColor: "#000",
            borderWidth: 1,
          },
          //color: Math.random()
        } as ScatterSeriesOption;
      }),
  };
});
</script>
<template>
  <VChart :option="options" :init-options="{
    height: 800,
    width: 800,
  }" class="h-[800px]" />
</template>
