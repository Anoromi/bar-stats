<script setup lang="tsx">
import Toaster from "./components/ui/toast/Toaster.vue";

const { color } = useColor();

const d = document?.documentElement;

watchEffect(() => {
  if (d) d.classList.toggle("dark", color.value === "dark");
});

//useHead(
//  computed(() => {
//    return ({
//      bodyAttrs: {
//        class: color.value,
//      },
//    });
//  }),
//);
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
