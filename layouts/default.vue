<script setup lang="ts">
console.log('layout working')
</script>

<template>
  <main class="flex flex-col overflow-auto h-screen">
    <header class="h-20 bg-slate-300">
    </header>
    <slot/>
  </main>
</template>
