<script setup lang="ts">
import { MoonIcon, SunIcon } from "@radix-icons/vue";

const { color } = useColor();

function invertColor() {
  if (color.value === "light") {
    color.value = "dark";
  } else color.value = "light";
}

useEChartThemes()
</script>

<template>
  <main class="flex h-screen flex-col overflow-auto">
    <header class="flex h-16 items-baseline bg-emphasis px-2 py-4 text-surface-foreground sm:px-4">
      <NuxtLink class="text-2xl text-primary" to="/">
        <b>BAR</b> Charted
      </NuxtLink>
      <nav class="ml-auto mr-10 flex gap-x-4 items-center">
        <Button variant="ghost" size="icon" @click="invertColor">
          <ClientOnly>
            <MoonIcon v-if="color === 'dark'"></MoonIcon>
            <SunIcon v-else></SunIcon>
          </ClientOnly>
        </Button>
        <NuxtLink class="text-primary font-bold text-lg" to="/general">
          Overview
        </NuxtLink>
      </nav>
    </header>
    <slot></slot>
  </main>
</template>
