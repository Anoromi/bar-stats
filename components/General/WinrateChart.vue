<script setup lang="tsx">
const props = defineProps<{
  data: Record<string, number>;
}>();

const factionWinrate = computed(() => {
  const winrate = props.data;
  return Object.keys(winrate).map((faction) => {
    return { name: faction, ratio: winrate[faction] };
  }).filter(v => v.name === 'Random');
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

const option = computed<ECOption>(() => {
  const colors = factionWinrate.value.map((v) => {
    switch (v.name) {
      case "Armada":
        return "blue";
      case "Cortex":
        return "red";
      default:
        throw new Error("Weird faction name" + v.name);
    }
  });
  return {
    title: {
      text: "Faction win rate",
    },
    xAxis: {
      type: "category",
      data: factionWinrate.value.map((v) => v.name),
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
  <VChart ref="winrate-canvas" :option="option" :init-options="{
    height: 400,
  }" class="h-[400px]"></VChart>
</template>
