<script setup lang="tsx">
const props = defineProps<{
  data: [os: number, time: number][];
}>();

const option = computed<ECOption>(() => ({
  title: {
    text: "Avg os to time",
  },
  xAxis: {
    type: "value",
    name: 'average os' 
  },
  yAxis: {
    type: "value",
    name: 'time' 
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
}));
</script>

<template>
  <VChart :option="option" :init-options="{ height: 400 }" class="h-[400px]"></VChart>
</template>
