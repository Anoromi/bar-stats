<script setup lang="tsx">
import { RadioGroupRoot, RadioGroupItem } from "radix-vue";
import { useField } from "vee-validate";

const props = defineProps<{ name: string }>();

const formField = useField<string | undefined>(props.name);

const values = ref(["500", "1000", "3000"]);
</script>
<template>
  <div>
    <fieldset>
      <Label as="legend" class="mb-2"> Limit </Label>

      <RadioGroupRoot
        class="flex flex-col gap-2.5"
        :model-value="formField.value.value"
        aria-label="View density"
        @update:model-value="(v) => formField.setValue(v)"
      >
        <div class="flex items-center space-x-4">
          <RadioGroupItem
            v-for="v in values"
            :key="v"
            class="py-2, rounded-[0.6rem] border border-solid border-foreground/80 px-3 text-surface-foreground transition-colors hover:bg-primary/20 active:bg-primary/10 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            :value="v"
          >
            {{ v }}
          </RadioGroupItem>
        </div>
      </RadioGroupRoot>
    </fieldset>
  </div>
</template>
