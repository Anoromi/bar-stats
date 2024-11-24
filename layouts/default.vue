<script setup lang="ts">
import {
  GithubLogoIcon,
  HamburgerMenuIcon,
  MoonIcon,
  SunIcon,
} from "@radix-icons/vue";
import { Popover } from "~/components/ui/popover";
import PopoverContent from "~/components/ui/popover/PopoverContent.vue";
import PopoverTrigger from "~/components/ui/popover/PopoverTrigger.vue";

const { color } = useColor();

function invertColor() {
  if (color.value === "light") {
    color.value = "dark";
  } else color.value = "light";
}

useEChartThemes();
</script>

<template>
  <main class="flex h-screen flex-col overflow-auto">
    <header
      class="flex h-16 items-baseline bg-emphasis px-2 py-4 text-surface-foreground sm:px-4"
    >
      <NuxtLink class="text-2xl text-primary" to="/">
        <b>BAR</b> Charted
      </NuxtLink>
      <nav class="ml-auto mr-10 hidden items-center gap-x-4 sm:flex">
        <Button variant="ghost" size="icon" @click="invertColor">
          <ClientOnly>
            <MoonIcon v-if="color === 'dark'"></MoonIcon>
            <SunIcon v-else></SunIcon>
          </ClientOnly>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          as-child
          href="https://github.com/Anoromi/bar-stats"
          @click="invertColor"
        >
          <NuxtLink>
            <GithubLogoIcon />
          </NuxtLink>
        </Button>
        <NuxtLink class="ml-2 text-lg font-bold text-primary" to="/stats">
          Stats
        </NuxtLink>
        <NuxtLink class="ml-2 text-lg font-bold text-primary" to="/blog">
          Blog
        </NuxtLink>
      </nav>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="link" class="ml-auto sm:hidden">
            <HamburgerMenuIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="bg-surface">
          <ul class="flex flex-col gap-y-4">
            <li class="flex gap-x-2">
              <Button
                variant="ghost"
                size="icon"
                class="place-self-end"
                @click="invertColor"
              >
                <ClientOnly>
                  <MoonIcon v-if="color === 'dark'"></MoonIcon>
                  <SunIcon v-else></SunIcon>
                </ClientOnly>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                as-child
                href="https://github.com/Anoromi/bar-stats"
                @click="invertColor"
              >
                <NuxtLink>
                  <GithubLogoIcon />
                </NuxtLink>
              </Button>
            </li>
            <li>
              <NuxtLink
                class="ml-2 text-lg font-bold text-primary"
                to="/stats"
              >
                Stats
              </NuxtLink>
            </li>
            <li>
              <NuxtLink class="ml-2 text-lg font-bold text-primary" to="/blog">
                Blog
              </NuxtLink>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
    </header>
    <slot></slot>
  </main>
</template>
