<script setup lang="tsx">
const isDev = import.meta.dev;
</script>

<template>
  <ClientOnly v-if="isDev">
    <slot />
  </ClientOnly>
  <slot v-else />
</template>
