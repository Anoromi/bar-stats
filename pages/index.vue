<script setup lang="ts">
import Command from '~/components/ui/command/Command.vue';
import { cn } from '~/lib/utils';
import { CheckIcon, ChevronDownIcon } from '@radix-icons/vue'
import type { CachedUsersResponse } from '~/server/api/cached-users';

definePageMeta({
  layout: 'default'
})

const { data: allCachedUsers, execute: executeAllCachedUsers } = useLazyFetch('/api/cached-users', {
  immediate: false,
})

const open = ref(false)
const searchedUser = ref('')
const value = ref<CachedUsersResponse[number]>()


const { data: users, execute: usersExecute } = useAsyncData(async () => {
  const r = allCachedUsers.value
  if (r === undefined || r === null)
    return []

  const searchedValue = searchedUser.value
  if (searchedValue.length < 3) return []
  const collator = Intl.Collator(undefined, { sensitivity: 'accent' })
  return sortedFilter(r, (v) => {
    if (v.username.toLocaleLowerCase().startsWith(searchedValue.toLocaleLowerCase())) return 0
    return collator.compare(v.username, searchedValue)
  }, (v) => {
    if (v.username.toLocaleLowerCase().startsWith(searchedValue.toLocaleLowerCase())) return 0
    return collator.compare(v.username, searchedValue)
  })
}, {
  immediate: false,
  watch: [allCachedUsers, searchedUser]
})

const trimmedUsers = computed(() => {
  return (users.value ?? []).slice(0, 20)
})

onMounted(() => {
  executeAllCachedUsers()
  usersExecute()
})
</script>

<template>
  <article>
    <div>
      Hello there
    </div>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button variant="outline" role="combobox" :aria-expanded="open"
          class="w-[200px] justify-between">
          {{ value?.username ??
            "Select user..." }}
          <ChevronDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[200px] p-0">
        <Command :search-term="searchedUser"
          @update:search-term="(e) => searchedUser = e">
          <CommandInput class="h-9" placeholder="Search framework..." />
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
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </article>
</template>