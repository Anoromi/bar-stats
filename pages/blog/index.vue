<script setup lang="ts">
const { data: blogs } = useAsyncData("blogs", async () => {
  return (await fetchContentNavigation(queryContent("blog")))[0].children;
});

watchEffect(() => {
  console.log("blogs", blogs.value);
});
</script>
<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="w-full max-w-[40rem] flex-1 gap-y-4 pt-8">
      <h1 class="mb-10 text-4xl font-bold">Blogs</h1>

      <section v-for="blog in blogs ?? []" :key="blog._id" class="mt-8">
        <NuxtLink :to="blog._path" class="text-2xl hover:underline">
          {{ blog.title }}
        </NuxtLink>
        <div class="mt-4">
          <span
            ><span class="font-semibold">Published:</span>
            {{ blog.publishedAt }}</span
          >
          <span class="ml-8"
            ><span class="font-semibold">Author:</span> {{ blog.author }}</span
          >
        </div>
      </section>
    </div>
  </article>
</template>
