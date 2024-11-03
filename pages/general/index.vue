<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/battleProcessor/worker";
import { toast } from "~/components/ui/toast";

const route = useRoute();

const allowedDataLimits = ["500", "1000", "5000"] as const satisfies unknown[];
const allowedOsOptions = [
  "<=20",
  ">=20",
  ">=25",
  ">=15",
] as const satisfies unknown[];
const binaryOptions = ["Yes", "No"] as const satisfies unknown[];

const formSchema = toTypedSchema(
  z.object({
    users: z
      .object({
        id: z.number().array(),
        name: z.string(),
        countryCode: z.string(),
      })
      .array()
      .default([]),
    map: z
      .string()
      .optional(),
    limit: z.enum(allowedDataLimits).default("500"),
    startDate: z.string().date().optional(),
    battleType: z.string().default("8v8"),
    osSelection: z.enum(allowedOsOptions).optional(),
    isRanked: z.enum(binaryOptions).default("Yes"),
    waterIsLava: z.enum(binaryOptions).default("No"),
  }),
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
  map: route.query.map as string,
  battleType: route.query.battleType as string | undefined,
  }
});

const { worker } = useWorkerServers().battleProcessorWorker;

const request = shallowRef<unknown>(null);
const results = ref<BattlesProcessorResponse>();

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
  toast({
    title: "Form submitted!",
    description: JSON.stringify(values),
  });
  const { map, users, limit, battleType, osSelection, waterIsLava, isRanked } =
    form.values;

  const currentRequest: BattlesProcessorRequest = {
    type: "battle",
    params: {
      battleType: battleType!,
      map: map ?? null,
      users: users?.flatMap((v) => v.id) ?? null,
      limit: limit !== undefined ? parseInt(limit) : null,
      afterBattle: null,
      osSelection: osSelection ?? null,
      waterIsLava: waterIsLava === "Yes",
      rankedGame: isRanked === "Yes",
    },
  } as const;
  request.value = currentRequest;
  console.log(worker);
  worker.value!.request(currentRequest).then((v) => {
    if (request.value === currentRequest) results.value = v;
  });
});

function cleanForm() {
  form.resetForm();
}
</script>

<script lang="ts">
export type GeneralPageQuery = {
  map: string;
  battleType: string | null
};
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="flex w-full flex-1 flex-col xl:flex-row xl:justify-center">
      <form
        class="relative mb-4 mt-4 flex h-max flex-col gap-y-4 rounded-2xl p-4 sm:mt-10 md:max-w-96 xl:w-96 xl:bg-surface xl:shadow-md"
        @submit="onSubmit"
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
          <Button
            type="button"
            variant="outline"
            class="flex-1"
            @click="cleanForm"
            >Clear</Button
          >
          <Button type="submit" variant="default" class="flex-1">Search</Button>
        </div>
      </form>

      <div class="flex min-w-0 flex-1">
        <LazyGeneralDataDisplay
          v-if="results !== undefined && results.data.battles.length > 0"
          :results="results"
        >
        </LazyGeneralDataDisplay>
        <div
          v-else-if="results !== undefined"
          class="ml-40 mt-20 flex w-full text-2xl font-bold"
        >
          No battles were found for these settings. <br/>
          Try setting a different battle type, or chose a different map.
        </div>
        <div v-else class="flex-1"></div>
      </div>
    </div>
  </article>
</template>
