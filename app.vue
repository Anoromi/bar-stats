<script setup lang="tsx">
const { color } = useColor();

const d = document?.body;

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
  </NuxtLayout>
</template>
