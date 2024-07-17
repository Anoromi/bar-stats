<script setup lang="ts">
import Command from '~/components/ui/command/Command.vue';
import { cn } from '~/lib/utils';
import type { TestRequestQuery } from '~/server/api/test';


const counter = ref(0)

const { data } = useFetch('/api/cached-users')


const hehe = computed(() => {
  const r = data.value
  if (r === undefined)
    return []

  return r?.filter(v => v.username.startsWith("An"))
})

function buttonClicked(e: MouseEvent) {
  console.log(e)
  counter.value++
}

//onMounted(() => {
//  $fetch('https://api.bar-rts.com/replays?page=1&limit=24&hasBots=false&endedNormally=true').then(v => console.log(v))
//})

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
]

const open = ref(false)
const value = ref('')


</script>
<template>
  <div class="flex flex-col">
    <div v-for="item in hehe">

      {{ item.username }}

    </div>
    <!--<span class="bg-card text-card-foreground">Hello there {{ counter }} {{ data?.hello }} </span> -->
    <Button variant="default" @click="buttonClicked">Click me</Button>
  </div>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button variant="outline" role="combobox" :aria-expanded="open"
        class="w-[200px] justify-between">
        {{ value
          ? frameworks.find((framework) => framework.value ===
            value)?.label
          : "Select framework..." }}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput class="h-9" placeholder="Search framework..." />
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem v-for="framework in frameworks"
              :key="framework.value" :value="framework.value" @select="(ev) => {
                if (typeof ev.detail.value === 'string') {
                  value = ev.detail.value
                }
                open = false
              }">
              {{ framework.label }}
              <Check :class="cn(
                'ml-auto h-4 w-4',
                value === framework.value ? 'opacity-100' : 'opacity-0',
              )" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>