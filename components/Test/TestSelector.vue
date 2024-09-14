<script setup lang="tsx">
import { CheckIcon, ChevronDownIcon } from "@radix-icons/vue";
import { isClient, useDebounce } from "@vueuse/core";
import { cn } from "~/lib/utils";
import type { GetMapSuggestionQuery } from "~/server/api/map-suggestion";
import type { FieldSlotProps } from "~/utils/types/fieldSlotProps";

defineProps<
  { languages: { label: string; value: string }[] } & FieldSlotProps<
    string | undefined
  >
>();

const mapSearchValue = ref("");
const debouncedSearchValue = useDebounce(mapSearchValue, 300);

const computedQuery = computed<GetMapSuggestionQuery>(() => {
  return {
    name: debouncedSearchValue.value,
  };
});

const { data: mapSuggestions, status } = useFetch("/api/map-suggestion", {
  query: computedQuery,
  server: false
});

</script>

<template>
  <FormItem class="flex flex-col" name="hello">
    <FormLabel>Language</FormLabel>
    <Popover>
      <PopoverTrigger as-child>
        <FormControl>
          <Button variant="outline" role="combobox" :class="cn('w-[200px] justify-between', !value && 'text-muted-foreground')
            ">
            {{
              value
                ? languages.find((language) => language.value === value)?.label
                : "Select language..."
            }}
            <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent class="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>Nothing found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem v-for="language in languages" :key="language.value" :value="language.label" @select="() => {
                  setValue(language.value);
                }
                ">
                <CheckIcon :class="cn(
                  'mr-2 h-4 w-4',
                  language.value === value ? 'opacity-100' : 'opacity-0',
                )
                  " />
                {{ language.label }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <FormMessage />
  </FormItem>
</template>
