<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { cn } from "~/lib/utils";

import { formData, type GeneralFormData } from "~/utils/general/formSchema";

const { binaryOptions, allowedOsOptions, allowedDataLimits, schema } = formData;
const formSchema = toTypedSchema(schema);

const props = defineProps<{
  onSubmit: (data: GeneralFormData) => Promise<void>;
  initialValues: Partial<GeneralFormData>;
  center: boolean;
}>();

const form = useForm({
  validationSchema: formSchema,
  initialValues: props.initialValues,
});

function cleanForm() {
  form.resetForm();
}

const submitting = ref(false);
const submit = form.handleSubmit(async (values) => {
  submitting.value = true;
  const result = await props.onSubmit(values);
  submitting.value = false;
  return result;
});
</script>
<template>
  <form
    :class="
      cn(
        'z-10 mb-4 mt-4 flex h-max translate-x-0 transform flex-col gap-y-4 rounded-2xl p-4 transition-all duration-1000 sm:mt-10 sm:w-96 xl:fixed xl:left-4 xl:bg-surface xl:shadow-md',
        {
          'xl:left-[50%] xl:w-[34rem] xl:translate-x-[-50%]': center,
        },
      )
    "
    @submit="submit"
  >
    <legend class="mb-2 text-lg font-bold">Filter</legend>
    <GeneralMapSelector name="map"></GeneralMapSelector>
    <!-- <GeneralUserSelector name="users"></GeneralUserSelector> -->
    <FormField v-slot="{ componentField }" name="battleType">
      <FormItem>
        <FormLabel>Battle type</FormLabel>
        <FormControl>
          <Input type="text" placeholder="8v8" v-bind="componentField" />
        </FormControl>
        <FormDescription> 8v8, 1v1, 4v4 ... </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <GeneralRadioTabsInput
      name="limit"
      :values="allowedDataLimits.map((v) => ({ label: v, value: v }))"
      label="Player limit"
    >
      <template #description>
        All data is sent to you. Loading might be slow
      </template>
    </GeneralRadioTabsInput>
    <GeneralRadioTabsInput
      name="osSelection"
      :values="[
        { label: 'Any', value: undefined },
        ...allowedOsOptions.map((v) => ({ label: v, value: v }) as const),
      ]"
      label="Average os"
    ></GeneralRadioTabsInput>
    <GeneralRadioTabsInput
      name="isRanked"
      :values="binaryOptions.map((v) => ({ label: v, value: v }))"
      label="Ranked game"
    >
    </GeneralRadioTabsInput>
    <GeneralRadioTabsInput
      name="waterIsLava"
      :values="binaryOptions.map((v) => ({ label: v, value: v }))"
      label="Water is lava"
    ></GeneralRadioTabsInput>
    <!--         <GeneralDateInput name="startDate"></GeneralDateInput> -->

    <div class="flex gap-x-2">
      <Button type="button" variant="outline" class="flex-1" @click="cleanForm"
        >Clear</Button
      >
      <Button type="submit" variant="default" class="flex-1">Search</Button>
    </div>
    <div
      :class="
        cn(
          'rounded-md px-5 py-1 text-center opacity-100 outline outline-1 outline-foreground/50 transition-opacity duration-300',
          {
            'opacity-0': !submitting,
          },
        )
      "
    >
      Loading
    </div>
  </form>
</template>
