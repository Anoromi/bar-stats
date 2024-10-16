<script setup lang="tsx">
import { RadioGroupRoot, RadioGroupItem } from "radix-vue";
import { useField } from "vee-validate";

const props = defineProps<{ name: string }>();

const formField = useField<string | undefined>(props.name);
</script>
<template>
  <div>
    <fieldset>
      <legend class="mb-2">Limit</legend>
      <RadioGroupRoot
        class="flex flex-col gap-2.5"
        :model-value="formField.value.value"
        aria-label="View density"
        @update:model-value="(v) => formField.setValue(v)"
      >
        <div class="flex items-center space-x-4">
          <RadioGroupItem
            class="py-2, rounded-[0.6rem] border border-solid border-foreground/80 px-3 text-surface-foreground transition-colors hover:bg-primary/20 active:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            value="1000"
          >
            1000
          </RadioGroupItem>
          <RadioGroupItem
            class="py-2, rounded-[0.6rem] border border-solid border-foreground/80 px-3 text-surface-foreground transition-colors hover:bg-primary/20 active:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            value="3000"
          >
            3000
          </RadioGroupItem>
        </div>
      </RadioGroupRoot>
    </fieldset>
  </div>
</template>
