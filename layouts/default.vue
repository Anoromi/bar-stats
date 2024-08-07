<script setup lang="ts">
</script>

<template>
  <main class="flex flex-col overflow-auto h-screen">
    <header class="h-16 bg-surface text-surface-foreground flex items-center px-2 sm:px-4">
      <NuxtLink class="text-primary text-2xl" to="/">
        <b>BAR</b> Stats
      </NuxtLink>
    </header>
    <slot></slot>
  </main>
</template>
