<script setup lang="tsx">
import { CheckIcon, ChevronDownIcon, Cross2Icon } from "@radix-icons/vue";
import { useDebounce } from "@vueuse/core";
import { useField, useFieldArray } from "vee-validate";
import { cn } from "~/lib/utils";
import type { UserDto } from "~/server/utils/dto/dto";
import FormItem from "../ui/form/FormItem.vue";
import type { CancelablePromise } from "~/utils/worker/core/cancelablePromise";
import { WorkerClient } from "~/utils/worker/core/client";
import type {
  UserCacheRequest,
  UserCacheResponse,
} from "~/utils/worker/userCacheWorker";

//const props = defineProps<FieldArrayContext<UserDto>>();

const props = defineProps<{
  name: string;
}>();
const opened = ref(false);

const fieldData = useField<UserDto[]>(props.name);
const arrayData = useFieldArray<UserDto>(props.name);

const userSuggestionsClient =
  shallowRef<WorkerClient<UserCacheRequest, UserCacheResponse>>();

const searchValue = ref("");
const debouncedSearchValue = useDebounce(searchValue, 300);

const lastTask = shallowRef<CancelablePromise<unknown>>();
const { data: userSuggestions, status } = useLazyAsyncData(
  "user-suggestions",
  async () => {
    if (lastTask.value !== undefined) lastTask.value.cancel();
    if (userSuggestionsClient.value === undefined) return;
    const data = await userSuggestionsClient.value.request({
      value: debouncedSearchValue.value,
      type: "get-users",
    } satisfies UserCacheRequest);
    console.log("got data", data, debouncedSearchValue.value);
    return data.data;
  },
  {
    watch: [userSuggestionsClient, debouncedSearchValue],
    server: false,
  },
);

const isLoading = computed(() => status.value === "pending");

function isIncluded(value: UserDto) {
  return arrayData.fields.value.some(
    (v) => v.value.username === value.username,
  );
}

onNuxtReady(() => {
  const worker = new Worker(
    new URL("~/utils/worker/userCacheWorker", import.meta.url),
    { type: "module" },
  );
  userSuggestionsClient.value = new WorkerClient<
    UserCacheRequest,
    UserCacheResponse
  >(worker);
});
</script>

<template>
  <FormItem class="flex flex-col">
    <FormLabel>User</FormLabel>
    <template v-if="arrayData.fields.value.length !== 0">
      <FormField
        v-for="(user, index) in arrayData.fields.value"
        :key="user.value.username"
        :name="`${name}[${index}]`"
      >
        <FormLabel>
          {{ user.value.username }}
        </FormLabel>
        <Button
          @click="(e: MouseEvent) => {
          console.log('clicked')
          e.stopPropagation(); arrayData.remove(index)
        }"
        >
          <Cross2Icon />
        </Button>
      </FormField>
    </template>

    <Popover v-model:open="opened">
      <PopoverTrigger as-child>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            :class="
              cn(
                ' min-w-72 max-w-96 justify-between',
                userSuggestions !== null && 'text-muted-foreground',
              )
            "
          >
            <template v-if="arrayData.fields.value.length !== 0">
              <FormField
                v-for="(user, index) in arrayData.fields.value"
                :key="user.value.username"
                :name="`${name}[${index}]`"
              >
                <FormLabel>
                  {{ user.value.username }}
                </FormLabel>
                <Button
                  @click="
                    (e) => {
                      console.log('clicked');
                      e.stopPropagation();
                      arrayData.remove(index);
                    }
                  "
                >
                  <Cross2Icon />
                </Button>
              </FormField>
            </template>
            <template v-else> Select user... </template>
            <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent class="w-72 p-0 bg-background">
        <Command v-model:search-term="searchValue" :filter-function="(v) => v">
          <CommandInput placeholder="Search map..." />
          <CommandEmpty>
            <template v-if="isLoading">Loading </template>
            <template v-else>Nothing found.</template>
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="user in userSuggestions"
                :key="user.username"
                :value="user"
                @select="
                  () => {
                    opened = false;
                    arrayData.push(user);
                  }
                "
              >
                <CheckIcon
                  :class="
                    cn(
                      'mr-2 h-4 w-4',
                      isIncluded(user) ? 'opacity-100' : 'opacity-0',
                    )
                  "
                />
                <NuxtImg
                class="mx-2"
                  :src="`https://flagcdn.com/16x12/${user.countryCode!.toLowerCase()}.png`"
                  :srcset="`
                    https://flagcdn.com/32x24/${user.countryCode!.toLowerCase()}.png 2x,
                    https://flagcdn.com/48x36/${user.countryCode!.toLowerCase()}.png 3x
                  `"
                  width="16"
                  height="12"
                  :alt="user.countryCode!"
                />
                {{ user.username }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </FormItem>
</template>
