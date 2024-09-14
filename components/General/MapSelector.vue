<script setup lang="tsx">
import { CheckIcon, ChevronDownIcon, StarFilledIcon } from "@radix-icons/vue";
import { useDebounce } from "@vueuse/core";
import { cn } from "~/lib/utils";
import type { GetMapSuggestionQuery } from "~/server/api/map-suggestion";
import type { FieldSlotProps } from "~/utils/types/fieldSlotProps";

const props = defineProps<FieldSlotProps<string | undefined>>();

const mapSearchValue = ref("");
const debouncedSearchValue = useDebounce(mapSearchValue, 300);

const computedQuery = computed<GetMapSuggestionQuery>(() => {
  return {
    name: debouncedSearchValue.value,
  };
});

const { data: mapSuggestions, status } = useFetch("/api/map-suggestion", {
  query: computedQuery,
  server: false,
});

const isLoading = computed(() => status.value === "pending");
const mapModelOpened = ref(false);
</script>
<template>
  <FormItem class="flex flex-col">
    <FormLabel>Map</FormLabel>
    <Popover v-model:open="mapModelOpened">
      <PopoverTrigger as-child>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            :class="
              cn(
                ' min-w-72 max-w-96 justify-between',
                mapSuggestions !== null && 'text-muted-foreground',
              )
            "
          >
            {{ props.value ?? "Select map..." }}
            <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent class="w-72 p-0 bg-background">
        <Command
          v-model:search-term="mapSearchValue"
          :filter-function="(v) => v"
        >
          <CommandInput placeholder="Search user..." />
          <CommandEmpty>
            Nothing found.
            <template v-if="isLoading">Loading </template>
            <template v-else>Nothing found.</template>
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="map in mapSuggestions"
                :key="map.id"
                :value="map.name"
                @select="
                  () => {
                    props.setValue(map.name);
                    mapModelOpened = false;
                  }
                "
              >
                <CheckIcon
                  :class="
                    cn(
                      'mr-2 h-4 w-4',
                      map.name === props.value ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
                {{ map.name }}
                <StarFilledIcon
                  v-if="map.subclassOfId === null"
                  :class="cn('ml-2 h-4 w-4 opacity-70')"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <FormMessage />
  </FormItem>
</template>
