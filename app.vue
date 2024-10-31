<script setup lang="ts">
import Toaster from "./components/ui/toast/Toaster.vue";

const { color } = useColor();

const d = document?.documentElement;

watchEffect(() => {
  if (d) d.classList.toggle("dark", color.value === "dark");
});

</script>

<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <DevClientOnly>
      <Toaster />
    </DevClientOnly>
  </NuxtLayout>
</template>
