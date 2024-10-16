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
    limit: z.enum(["1000", "3000"]).default('1000'),
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

const results = ref<BattlesProcessorResponse>();

const onSubmit = form.handleSubmit((values) => {
  console.log("Form submitted!", values);
  toast({
    title: "Form submitted!",
    description: JSON.stringify(values),
  });
  const { map, users } = form.values;

  worker
    .value!.request({
      type: "battle",
      params: {
        battleType: null,
        map: map ?? null,
        users: users?.flatMap((v) => v.id) ?? null,
        limit: 3000,
      },
    })
    .then((v) => {
      console.log("worker result is ", v);
      results.value = v;
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
        <GeneralUserSelector name="users"></GeneralUserSelector>
        <GeneralLimitsInput name="limit"></GeneralLimitsInput>
        <Button type="submit" variant="outline">Update</Button>
      </form>

      <div class="min-w-0 flex-1 py-10 pr-5 xl:max-w-[56rem] xl:pl-20">
        <!-- <LazyGeneralClusterTest></LazyGeneralClusterTest> -->
        <template v-if="results !== undefined">
          <LazyGeneralMapPoints
            v-if="results.data.clusteredData !== undefined"
            :data="results.data.clusteredData!"
            :map="{
              name: results.data.map!.fileName!,
              height: results.data.map!.height!,
              width: results.data.map!.width!,
            }"
          ></LazyGeneralMapPoints>
          <Tabs default-value="average-os-2" class="min-h-[600px]">
            <TabsList class="flex">
              <TabsTrigger value="osdiff"> Os diff </TabsTrigger>
              <TabsTrigger value="average-os"> Average os spikey </TabsTrigger>
              <TabsTrigger value="average-os-2">
                Average os smooth
              </TabsTrigger>
              <TabsTrigger value="average-os-3">
                Average os smoother
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
            <LazyGeneralWinrateChart :data="results.data.factionWinrate">
            </LazyGeneralWinrateChart>

            <LazyGeneralTeamWinrateChart
              v-if="results.data.teamWinrate !== undefined"
              :data="results.data.teamWinrate"
            >
            </LazyGeneralTeamWinrateChart>
          </Tabs>
        </template>
      </div>
    </div>
  </article>
</template>
