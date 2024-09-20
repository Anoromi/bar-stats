<script setup lang="tsx">
const { color } = useColor();
useHead(
  computed(() => ({
    bodyAttrs: {
      class: color.value,
    },
  })),
);
</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>
