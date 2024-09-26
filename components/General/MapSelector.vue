<script setup lang="tsx">
import { CheckIcon, ChevronDownIcon, StarFilledIcon } from "@radix-icons/vue";
import { useDebounce, useResizeObserver } from "@vueuse/core";
import { cn } from "~/lib/utils";
import type { GetMapSuggestionQuery } from "~/server/api/map-suggestion";
import type Button from "../ui/button/Button.vue";
import type { ComponentPublicInstance } from "vue";
import { useField } from "vee-validate";

const props = defineProps<{ name: string }>();

const formField = useField<string | undefined>(props.name);

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

const id = useId();
const buttonId = id + "-button";
const button = useTemplateRef<ComponentPublicInstance>(buttonId);

const targetWidth = ref(0);

useResizeObserver(button, (e) => {
  const resize = e[0];
  targetWidth.value = resize.contentRect.width;
});

function select(value: string | undefined) {
  formField.setValue(value);
  mapModelOpened.value = false;
}
</script>
<template>
  <FormItem class="flex flex-col">
    <FormLabel>Map</FormLabel>
    <DevClientOnly>
      <Popover v-model:open="mapModelOpened">
        <PopoverTrigger as-child>
          <FormControl>
            <Button
              :ref="buttonId"
              variant="elevated"
              role="combobox"
              :class="
                cn(
                  'justify-between',
                  mapSuggestions !== null && 'text-muted-foreground',
                )
              "
            >
              {{ formField.value.value ?? "Select map..." }}
              <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          class="popover-width w-[--radix-popover-trigger-width] bg-background p-0"
        >
          <Command
            v-model:search-term="mapSearchValue"
            :filter-function="(v) => v"
          >
            <CommandInput placeholder="Search map..." />
            <CommandEmpty>
              <template v-if="isLoading">Loading </template>
              <template v-else>Nothing found</template>
            </CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  :key="'undefined'"
                  :value="'undefined'"
                  @select="
                    () => {
                      select(undefined);
                    }
                  "
                >
                  <CheckIcon
                    :class="
                      cn(
                        'mr-2 h-4 w-4',
                        formField.value.value === undefined
                          ? 'opacity-100'
                          : 'opacity-0',
                      )
                    "
                  />
                  None
                </CommandItem>
                <CommandItem
                  v-for="map in mapSuggestions"
                  :key="map.id"
                  :value="map.name"
                  @select="
                    () => {
                      select(map.name);
                    }
                  "
                >
                  <CheckIcon
                    :class="
                      cn(
                        'mr-2 h-4 w-4',
                        map.name === formField.value.value
                          ? 'opacity-100'
                          : 'opacity-0',
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
    </DevClientOnly>

    <FormMessage />
  </FormItem>
</template>
