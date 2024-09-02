<script setup lang="ts">
import {
  type ButtonHTMLAttributes,
  type EmitsOptions,
  type Events,
  type HTMLAttributes,
} from "vue";

import {
  Primitive,
  useForwardPropsEmits,
  type PrimitiveProps,
  type ToggleEmits,
} from "radix-vue";
import { type ButtonVariants, buttonVariants } from ".";

import { cn } from "@/lib/utils";
import type { PrimitiveEmmitedEvents } from "./primitiveEvents";

interface Props extends PrimitiveProps, PrimitiveEmmitedEvents {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});

const delegatedProps = computed(() => {
  const { class: _1, size: _2, variant: _3, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps);
</script>

<template>
  <Primitive
    :class="cn(buttonVariants({ variant, size }), props.class)"
    v-bind="forwarded"
  >
    <slot />
  </Primitive>
</template>
