<script setup lang="ts">
import { cn } from "~/lib/utils";
import { MagnifyingGlassIcon } from "@radix-icons/vue";
import type { CachedUsersResponse } from "~/server/api/cached-users";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxViewport,
} from "radix-vue";

definePageMeta({
  layout: "default",
});

const { data: allCachedUsers, execute: executeAllCachedUsers } = useLazyFetch(
  "/api/cached-users",
  {
    immediate: false,
  },
);

const open = ref(false);
const searchedUser = ref("");
const value = ref<CachedUsersResponse[number]>();

const { data: users, execute: usersExecute } = useAsyncData(
  async () => {
    const r = allCachedUsers.value;
    if (r === undefined || r === null) return [];

    const searchedValue = searchedUser.value;
    if (searchedValue.length < 3) return [];
    const collator = Intl.Collator(undefined, { sensitivity: "accent" });
    return sortedFilter(
      r,
      (v) => {
        if (
          v.username
            .toLocaleLowerCase()
            .startsWith(searchedValue.toLocaleLowerCase())
        )
          return 0;
        return collator.compare(v.username, searchedValue);
      },
      (v) => {
        if (
          v.username
            .toLocaleLowerCase()
            .startsWith(searchedValue.toLocaleLowerCase())
        )
          return 0;
        return collator.compare(v.username, searchedValue);
      },
    );
  },
  {
    immediate: false,
    watch: [allCachedUsers, searchedUser],
  },
);

const trimmedUsers = computed(() => {
  return (users.value ?? []).slice(0, 20);
});

onMounted(() => {
  executeAllCachedUsers();
  usersExecute();
});
</script>

<template>
  <article class="flex flex-col items-center">
    <div class="sm:max-w-[70rem] pt-10 sm:pt-[30%] flex flex-col">
      <ComboboxRoot v-model:search-term="searchedUser" v-model:open="open">
        <ComboboxAnchor
          :class="
            cn(
              'sm:w-[300px] flex gap-x-2 items-center bg-primary text-primary-foreground rounded-full px-6 py-3 hover:bg-primary/80 border border-primary transition-colors duration-300',
              {
                'bg-background text-foreground hover:bg-background hover:text-foreground':
                  open,
              },
            )
          "
        >
          <ComboboxInput
            class="bg-transparent outline-none text-xl min-w-0"
            :class="
              cn('placeholder-primary-foreground', {
                'placeholder-foreground': open,
              })
            "
            placeholder="Search user..."
            @click="open = true"
          />

          <MagnifyingGlassIcon
            class="h-5 w-5 min-w-0 shrink-0 font-extrabold"
          />
        </ComboboxAnchor>
        <ComboboxContent
          class="absolute z-10 w-full mt-2 sm:w-[300px] max-h-96 bg-background overflow-hidden rounded-xl shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <ComboboxViewport class="p-[5px]">
            <ComboboxEmpty class="font-medium text-center py-2">
              {{
                searchedUser.length < 3
                  ? "Type at least 2 characters"
                  : "No users found"
              }}
            </ComboboxEmpty>
            <ComboboxGroup class="py-2 px-1">
              <ComboboxItem
                v-for="option in users"
                :key="option.username"
                :value="option"
                class="text-lg py-1 px-2 select-none data-[highlighted]:bg-surface rounded-md"
              >
                <ComboboxItemIndicator
                  class="absolute left-0 w-[25px] inline-flex items-center justify-center"
                >
                  <Icon icon="radix-icons:check" />
                </ComboboxItemIndicator>
                <div>
                  {{ option.username }}
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
