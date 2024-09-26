<script setup lang="tsx">
import { CheckIcon, ChevronDownIcon, Cross2Icon } from "@radix-icons/vue";
import { useDebounce } from "@vueuse/core";
import { useField, useFieldArray } from "vee-validate";
import { cn } from "~/lib/utils";
import type { UserDto } from "~/server/utils/dto/dto";
import FormItem from "../ui/form/FormItem.vue";
import type { CancelablePromise } from "~/utils/worker/core/cancelablePromise";
import type {
  UserCacheRequest,
  UserCacheResponse,
} from "~/utils/worker/userCacheWorker";
import { useClientWorker } from "~/utils/worker/useClientWorker";

const props = defineProps<{
  name: string;
}>();
const opened = ref(false);

const _fieldData = useField<UserDto[]>(props.name);
const arrayData = useFieldArray<UserDto>(props.name);

const { worker: userSuggestionsClient } = useClientWorker<
  UserCacheRequest,
  UserCacheResponse
>(
  () =>
    new Worker(new URL("~/utils/worker/userCacheWorker", import.meta.url), {
      type: "module",
    }),
);

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

function selectUser(user: UserDto) {
  opened.value = false;
  const userIndex = arrayData.fields.value.findIndex(
    (v) => v.value.username === user.username,
  );
  if (userIndex === -1) arrayData.push(user);
  else arrayData.remove(userIndex);
}
</script>

<template>
  <FormItem class="flex flex-col">
    <FormLabel>User</FormLabel>
    <DevClientOnly>
      <Popover v-model:open="opened">
        <PopoverTrigger as-child>
          <FormControl>
            <Button
              variant="elevated"
              role="combobox"
              :class="
                cn(
                  'justify-between',
                  userSuggestions !== null && 'text-muted-foreground',
                )
              "
            >
              Select user...
              <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          class="w-[--radix-popover-trigger-width] bg-background p-0"
        >
          <Command
            v-model:search-term="searchValue"
            :filter-function="(v) => v"
          >
            <CommandInput placeholder="Search user..." />
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
                      selectUser(user);
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
                    :alt="user.countryCode?.slice(undefined, 2)"
                  />
                  {{ user.username }}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </DevClientOnly>
    <template v-if="arrayData.fields.value.length !== 0">
      <div class="flex flex-wrap gap-x-2 gap-y-2">
        <FormField
          v-for="(user, index) in arrayData.fields.value"
          :key="user.value.username"
          :name="`${name}[${index}]`"
        >
          <div
            class="bg-surface-high flex items-center rounded-lg py-1 pl-6 pr-2"
          >
            <FormLabel class="inline">
              {{ user.value.username }}
            </FormLabel>
            <Button
              variant="ghost"
              size="icon"
              class="rounded-full"
              @click.stop="
                () => {
                  arrayData.remove(index);
                }
              "
            >
              <Cross2Icon class="size-4" />
            </Button>
          </div>
        </FormField>
      </div>
    </template>
  </FormItem>
</template>
