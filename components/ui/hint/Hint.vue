<script setup lang="tsx">
import { InfoCircledIcon } from "@radix-icons/vue";
import type { HoverCardContentProps } from "radix-vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<
  HoverCardContentProps & { class?: HTMLAttributes["class"] }
>();
</script>
<template>
  <HoverCard>
    <HoverCardTrigger class="text-foreground-variant">
      <Button variant="ghost" size="icon" class="font-bold">
        <InfoCircledIcon />
      </Button>
    </HoverCardTrigger>
    <HoverCardContent v-bind="props">
      <slot />
    </HoverCardContent>
  </HoverCard>
</template>
