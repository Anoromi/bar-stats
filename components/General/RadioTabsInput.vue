<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem } from "radix-vue";
import { useField } from "vee-validate";
import FormLabel from "../ui/form/FormLabel.vue";

const props = defineProps<{
  name: string;
  values: { value: string | undefined; label: string }[];
  label: string;
}>();

const formField = useField<string | undefined>(props.name);
</script>
<template>
  <div>
    <FormItem>
      <FormLabel as="legend" class="mb-2"> {{ props.label }} </FormLabel>
      <RadioGroupRoot class="flex flex-wrap gap-2.5" :model-value="formField.value.value" aria-label="View density"
        @update:model-value="(v) => formField.setValue(v)">
        <RadioGroupItem v-for="v in props.values" :key="v.label"
          class="py-2, rounded-[0.6rem] border border-solid border-foreground/80 px-3 text-surface-foreground transition-colors hover:bg-primary/20 active:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          :value="v.value">
          {{ v.label }}
        </RadioGroupItem>
      </RadioGroupRoot>
      <FormDescription>
        <slot name="description" />
      </FormDescription>
    </FormItem>
  </div>
</template>
