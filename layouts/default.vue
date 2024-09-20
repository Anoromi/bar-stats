<script setup lang="ts">
import { MoonIcon } from "@radix-icons/vue";

const { color } = useColor();

function invertColor() {
  if (color.value === "light") {
    color.value = "dark";
  } else color.value = "light";
}
</script>

<template>
  <main class="flex h-screen flex-col overflow-auto">
    <header
      class="flex h-16 items-baseline bg-surface px-2 py-4 text-surface-foreground sm:px-4"
    >
      <NuxtLink class="text-2xl text-primary" to="/">
        <b>BAR</b> Stats
      </NuxtLink>
      <nav class="ml-12">
        <NuxtLink class="text-surface-foreground" to="/general">
          overview
        </NuxtLink>
        <Button variant="link" @click="invertColor">
          <MoonIcon></MoonIcon>
        </Button>
      </nav>
    </header>
    <slot></slot>
  </main>
</template>
