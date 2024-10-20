<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/battleProcessor/worker";
import { useClientWorker } from "~/utils/worker/useClientWorker";
import { toast } from "~/components/ui/toast";

const allowedDataLimits = ["500", "1000", "5000"] as const satisfies unknown[];
const allowedOsOptions = ["<=20", ">=20"] as const satisfies unknown[];

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
    map: z.string().optional(),
    limit: z.enum(allowedDataLimits).default("500"),
    startDate: z.string().date().optional(),
    battleType: z.string().default("8v8"),
    osSelection: z.enum(allowedOsOptions).optional()
  }),
);

const form = useForm({
  validationSchema: formSchema,
});

const { worker } = useClientWorker<
  BattlesProcessorRequest,
  BattlesProcessorResponse
>(
  () =>
    new Worker(new URL("~/utils/battleProcessor/worker", import.meta.url), {
      type: "module",
    }),
);

const request = shallowRef<unknown>(null);
const results = ref<BattlesProcessorResponse>();

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
  toast({
    title: "Form submitted!",
    description: JSON.stringify(values),
  });
  const { map, users, limit, battleType, osSelection } = form.values;

  const currentRequest : BattlesProcessorRequest = {
    type: "battle",
    params: {
      battleType: battleType!,
      map: map ?? null,
      users: users?.flatMap((v) => v.id) ?? null,
      limit: limit !== undefined ? parseInt(limit) : null,
      afterBattle: null,
      osSelection: osSelection ?? null
    },
  } as const;
  request.value = currentRequest
  worker.value!.request(currentRequest).then((v) => {
    console.log("worker result is ", v);
    if (request.value === currentRequest) results.value = v;
  });
});
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="flex w-full flex-1 flex-col xl:flex-row xl:justify-center">
      <form
        class="mb-4 mt-4 flex h-max flex-col gap-y-4 rounded-2xl p-4 sm:mt-10 md:max-w-96 xl:w-96 xl:bg-surface xl:shadow-md"
        @submit="onSubmit"
      >
        <legend class="mb-2 text-lg font-bold">Filter</legend>
        <GeneralMapSelector name="map"></GeneralMapSelector>
        <!-- <GeneralUserSelector name="users"></GeneralUserSelector> -->
        <GeneralRadioTabsInput
          name="limit"
          :values="allowedDataLimits.map((v) => ({ label: v, value: v }))"
          label="Player limit"
        ></GeneralRadioTabsInput>
        <GeneralRadioTabsInput
          name="osSelection"
          :values="[
            { label: 'Any', value: undefined },
            ...allowedOsOptions.map((v) => ({ label: v, value: v }) as const),
          ]"
          label="Os options"
        ></GeneralRadioTabsInput>
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

        <!--         <GeneralDateInput name="startDate"></GeneralDateInput> -->

        <Button type="submit" variant="outline">Update</Button>
      </form>

      <div class="min-w-0 flex-1 py-10 pr-5 xl:pl-20">
        <!-- <LazyGeneralClusterTest></LazyGeneralClusterTest> -->
        <template v-if="results !== undefined">
          <LazyGeneralMapPoints
            v-if="results.data.labeledPlayers !== undefined"
            :battles="results.data.battles"
            :player-clusters="results.data.labeledPlayers!"
            :map="{
              name: results.data.map!.fileName!,
              height: results.data.map!.height!,
              width: results.data.map!.width!,
            }"
            :max-teams="results.data.maxTeamCount"
            :cluster-count="results.data.clusterCount!"
          >
          </LazyGeneralMapPoints>
          <Tabs default-value="average-os-2" class="mt-10 min-h-[600px]">
            <TabsList class="flex">
              <TabsTrigger value="osdiff" class="text-base">
                Os diff
              </TabsTrigger>
              <TabsTrigger value="average-os" class="text-base">
                Average os spikey
              </TabsTrigger>
              <TabsTrigger value="average-os-2" class="text-base">
                Average os smooth
              </TabsTrigger>
              <TabsTrigger value="average-os-3" class="text-base">
                Average os smoother
              </TabsTrigger>
              <TabsTrigger value="min-os" class="text-base">
                Min os
              </TabsTrigger>
              <TabsTrigger value="max-os" class="text-base">
                Max os
              </TabsTrigger>
            </TabsList>
            <TabsContent value="osdiff">
              <LazyGeneralOsToTimeChart
                :data="results.data.osDiffToTime"
                :title="'Os diff'"
                :x-label="'maxOs - minOs'"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
            <TabsContent value="average-os">
              <LazyGeneralOsToTimeChart
                :data="results.data.osToTime"
                :title="'Average battle os spikey'"
                :x-label="'average os'"
                :max="50"
                :min="0"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
            <TabsContent value="average-os-2">
              <LazyGeneralOsToTimeChart
                :data="results.data.osToTime2"
                :title="'Average battle os smooth'"
                :x-label="'average os'"
                :max="50"
                :min="0"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
            <TabsContent value="average-os-3">
              <LazyGeneralOsToTimeChart
                :data="results.data.osToTime3"
                :title="'Average os smoother'"
                :x-label="'average os'"
                :max="50"
                :min="0"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
            <TabsContent value="min-os">
              <LazyGeneralOsToTimeChart
                :data="results.data.minOs"
                :title="'Min os'"
                :x-label="'min os'"
                :max="50"
                :min="0"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
            <TabsContent value="max-os">
              <LazyGeneralOsToTimeChart
                :data="results.data.maxOs"
                :title="'Max os'"
                :x-label="'max os'"
                :max="50"
                :min="0"
              >
              </LazyGeneralOsToTimeChart>
            </TabsContent>
          </Tabs>
          <LazyGeneralWinrateChart :data="results.data.factionWinrate">
          </LazyGeneralWinrateChart>

          <LazyGeneralTeamWinrateChart
            v-if="results.data.teamWinrate !== undefined"
            :data="results.data.teamWinrate"
          >
          </LazyGeneralTeamWinrateChart>
        </template>
      </div>
    </div>
  </article>
</template>
