<script setup lang="ts">
import { cn } from "~/lib/utils";
import { MagnifyingGlassIcon } from "@radix-icons/vue";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxRoot,
  ComboboxViewport,
} from "radix-vue";
import type { GetMapSuggestionQuery } from "~/server/api/map-suggestion";
import { debouncedRef } from "@vueuse/core";
import type { MapDto } from "~/server/utils/dto/dto";
import { generateURLParams } from "~/utils/battleProcessor/generateParams";
import type { GeneralPageQuery } from "./general/index.vue";

definePageMeta({
  layout: "default",
});

const open = ref(false);
const searchedMap = ref("");

const debouncedSearch = debouncedRef(searchedMap, 200);

const queryParams = computed(() => {
  return {
    name: debouncedSearch.value ?? "",
  } satisfies GetMapSuggestionQuery;
});

const { data: mapSuggestions } = useLazyFetch("/api/map-suggestion", {
  immediate: true,
  query: queryParams,
});

const trimmedSuggestions = computed(() => {
  return (mapSuggestions.value ?? []).slice(0, 6);
});

function mapSelected(map: MapDto) {
  navigateTo(
    "./general?" + generateURLParams<GeneralPageQuery>(["map", map.name]),
  );
}
</script>

<template>
  <article class="flex flex-col items-center">
    <h1
      class="mx-4 mt-[20vh] items-center stroke-1 text-2xl font-extrabold sm:text-3xl"
    >
      Venture forth into unknown lands of <br />
      <span class="text-primary">BAR Charts</span>
    </h1>
    <div class="flex w-full flex-col pt-10 sm:w-[600px] sm:max-w-[70rem]">
      <ComboboxRoot v-model:search-term="searchedMap" v-model:open="open">
        <ComboboxAnchor
          :class="
            cn(
              'mx-2 mt-[5vh] flex min-w-0 items-center gap-x-2 rounded-full border border-primary bg-primary px-6 py-3 text-primary-foreground transition-colors duration-300 hover:bg-primary/80 sm:mx-0 sm:w-full',
              {
                'bg-background text-foreground hover:bg-background hover:text-foreground':
                  open,
              },
            )
          "
        >
          <ComboboxInput
            class="min-w-0 flex-1 bg-transparent text-xl outline-none"
            :class="
              cn('placeholder-primary-foreground', {
                'placeholder-foreground': open,
              })
            "
            placeholder="Select map..."
            @click="open = true"
          />

          <MagnifyingGlassIcon
            class="h-5 w-5 min-w-0 shrink-0 font-extrabold"
          />
        </ComboboxAnchor>
        <ComboboxContent
          class="z-10 mt-2 max-h-96 w-full overflow-hidden rounded-xl will-change-[opacity,transform] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <ComboboxViewport class="p-[5px]">
            <ComboboxEmpty class="py-2 text-center font-medium">
              {{
                searchedMap.length < 3
                  ? "Type at least 2 characters"
                  : "No users found"
              }}
            </ComboboxEmpty>
            <ComboboxGroup class="px-1 py-2">
              <ComboboxItem
                v-for="option in trimmedSuggestions"
                :key="option.id"
                :value="option"
                class="select-none rounded-xl px-5 py-3 text-xl transition-colors duration-75 data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
                @select="mapSelected(option)"
              >
                <div>
                  {{ option.name }}
                </div>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxViewport>
        </ComboboxContent>
      </ComboboxRoot>

      <!--<Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button variant="default" role="combobox" size="custom"
            :aria-expanded="open"
            class="w-full sm:w-[300px] text-xl py-3 px-6 justify-between rounded-full border border-primary"
            :class="{
              'bg-background text-foreground hover:bg-background hover:text-foreground': open
            }">
            {{ value?.username ??
              "Search player..." }}
            <MagnifyingGlassIcon
              class="ml-2 h-5 w-5 shrink-0 font-extrabold" />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full sm:w-[300px] p-0">
          <Command :search-term="searchedUser"
            @update:search-term="(e) => searchedUser = e">
            <CommandInput class="h-9"
              placeholder="Search framework..." />
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem v-for="user in trimmedUsers"
                  :key="user.username" :value="user.username" @select="(ev) => {
                    //if (typeof ev.detail.value === 'string') {
                    //  value = ev.detail.value
                    //}
                    value = user
                    open = false
                  }">
                  {{ user.username }}
                  <CheckIcon :class="cn(
                    'ml-auto h-4 w-4',
                    value?.username === user.username ? 'opacity-100' : 'opacity-0',
                  )" />
                </CommandItem>
                SSS
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover> -->
    </div>
  </article>
</template>
<style scoped>
/* @keyframes stroke-pulse { */
/*   0% { */
/*     -webkit-text-stroke: 0px var(--tw-shadow-color); */
/*   } */
/**/
/*   100% { */
/*     -webkit-text-stroke: 3px var(--tw-shadow-color); */
/*   } */
/* } */
</style>
