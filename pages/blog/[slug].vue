<script setup lang="ts">
const params = useRoute().path;
const { data } = await useAsyncData(() => queryContent(params).findOne());
console.log("hello there", useRoute().params.slug);
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="w-full max-w-[40rem] flex-1 gap-y-4 pt-8">
      <ContentRenderer :value="data ?? undefined" class="w-full max-w-[40rem] flex-1 gap-y-4 pt-8">
        <template #empty> Sorry couldn't find anything </template>

        <h1 class="text-4xl font-bold">{{ data?.title }}</h1>
        <div class="mt-4">
          <span><span class="font-semibold">Published:</span>
            {{ data?.publishedAt }}</span>
          <span class="ml-8"><span class="font-semibold">Author:</span> {{ data?.author }}</span>
        </div>
        <ContentRendererMarkdown :value="data!" class="mt-4 text-lg">
        </ContentRendererMarkdown>
      </ContentRenderer>
    </div>
  </article>
</template>

<style scoped>
:deep(h2) {
  @apply mt-12 text-2xl;
}

:deep(p) {
  @apply mb-5 mt-5;
}

:deep(li) {
  @apply list-inside;
}
:deep(ol) li {
  @apply list-decimal list-inside;
}
</style>
