<script setup lang="tsx">
import consola from "consola";
import type { BattleProcessorParams } from "~/utils/battlesProcessor";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import { cn } from "~/lib/utils";
import { CheckIcon, ChevronDownIcon, StarFilledIcon, StarIcon } from "@radix-icons/vue";

const formSchema = toTypedSchema(
  z.object({
    //username: z.string().min(2).max(50),
    map: z.string(),
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

const mapModelOpened = ref(false)

watchEffect(async () => {
  const client = import.meta.client;
  if (client) {
    const hehe2 = new Worker(
      new URL("~/utils/battlesProcessor", import.meta.url),
      {
        type: "module",
      },
    );
    hehe2.postMessage("eheheheh");
    hehe2.postMessage({
      type: "battle",
      requestParams: {
        map: null,
        users: null,
        limit: null,
        battleType: null,
      },
    } satisfies BattleProcessorParams);
    consola.log("loaded", hehe2);
    hehe2.onmessage = (event) => {
      console.log(event);
    };
  }
});

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
});

const mapSearchValue = ref("");
const { mapSuggestions, isLoading } = useMapSearch(mapSearchValue);
</script>

<template>
  <form @submit="onSubmit">
    {{ mapSearchValue }}
    <FormField name="language">
      <FormItem class="flex flex-col">
        <FormLabel>Map</FormLabel>
        <Popover v-modelv-model:open="mapModelOpened" >
          <PopoverTrigger as-child>
            <FormControl>
              <Button variant="outline" role="combobox" :class="cn(
                ' min-w-72 max-w-96 justify-between',
                mapSuggestions !== null && 'text-muted-foreground',
              )
                ">
                {{ form.values.map ?? "Select language..." }}
                <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent class="w-72 p-0 bg-background">
            <Command v-model:search-term="mapSearchValue" :filter-function="(v) => v" >
              <CommandInput placeholder="Search map..." />
              <CommandEmpty>
                <template v-if="isLoading">Loading </template>
                <template v-else>Nothing found.</template>
              </CommandEmpty>
              <CommandList>
                <CommandGroup>
                <CommandItem v-for="map in mapSuggestions" :key="map.id" :value="map.name" @select="() => {
                      form.setFieldValue('map', map.name);
                      mapModelOpened = false
                    }
                    ">
                    <CheckIcon :class="cn(
                      'mr-2 h-4 w-4',
                      map.name === form.values.map
                        ? 'opacity-100'
                        : 'opacity-0',
                    )
                      " />
                    {{ map.name }}
                    <StarFilledIcon v-if="map.subclassOfId === null"  :class="cn(
                      'ml-2 h-4 w-4 opacity-70',
                      
                    )" />
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <FormDescription>
          This is the language that will be used in the dashboard.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit"> Submit </Button>
  </form>
</template>
