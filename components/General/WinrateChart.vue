<script setup lang="tsx">
const props = defineProps<{
  data: Record<string, number>;
}>();

const factionWinrate = computed(() => {
  const winrate = props.data;
  console.log("winrate 1", winrate);
  return Object.keys(winrate)
    .map((faction) => {
      console.log("faction", faction);
      return { name: faction, ratio: winrate[faction] };
    })
    .filter((v) => v.name !== "Random");
});

//const canvas = useTemplateRef<ComponentPublicInstance>("winrate-canvas");
//const primaryColor = ref<string>();
//watchEffect(() => {
//  if (canvas.value === null) return;
//
//  console.log("$el", canvas.value.$el);
//  const canvasStyles = getComputedStyle(canvas.value.$el);
//  console.log("2", getComputedStyle(canvas.value.$el));
//  primaryColor.value = canvasStyles.getPropertyValue("--primary");
//});

function getFactionName(name: string) {
  switch (name) {
    case "Armada":
      return "Armada";
    case "Cortex":
      return "cortex";
    case "Unknown":
      return "Legion";
    default:
      throw new Error("Weird faction name " + name);
  }
}

const option = computed<ECOption>(() => {
  console.log("winrates", factionWinrate.value);
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
    title: {
      text: "Faction win factor",
    },
    xAxis: {
      type: "category",
      data: factionWinrate.value.map((v) => getFactionName(v.name)),
    },
    yAxis: {
      type: "value",
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
      },
    ],
  };
});
</script>

<template>
  <VChart
    ref="winrate-canvas"
    :option="option"
    :init-options="{
      height: 400,
    }"
    class="h-[400px]"
  ></VChart>
</template>
