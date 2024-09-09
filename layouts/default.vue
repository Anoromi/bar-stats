<script setup lang="ts"></script>

<template>
  <main class="flex flex-col overflow-auto h-screen">
    <header
      class="h-16 py-4 bg-surface text-surface-foreground flex items-baseline px-2 sm:px-4"
    >
      <NuxtLink class="text-primary text-2xl" to="/">
        <b>BAR</b> Stats
      </NuxtLink>
      <nav class="ml-12">
      <NuxtLink class="text-surface-foreground" to="/general">
        overview
      </NuxtLink>
      </nav>
    </header>
    <slot></slot>
  </main>
</template>
