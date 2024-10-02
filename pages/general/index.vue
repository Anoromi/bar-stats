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
import type { StackedBarDataRecord } from "@unovis/ts/components/stacked-bar/types";

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
    new Worker(
      new URL("~/utils/battleProcessor/worker", import.meta.url),
      { type: "module" },
    ),
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
        limit: 1000,
      },
    })
    .then((v) => {
      console.log("worker result is ", v);
      results.value = v;
    });
});


const color = (d: StackedBarDataRecord<unknown>, i: number) =>
  ["#04c0c7", "#5144d3", "#da348f"][i];
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="flex w-full flex-1 flex-col xl:flex-row xl:justify-center">
      <form
        class="mb-4 mt-4 flex h-max flex-col gap-y-4 md:max-w-96 rounded-2xl xl:bg-surface p-4 sm:mt-10 xl:w-96 xl:shadow-md"
        @submit="onSubmit"
      >
        <legend class="mb-2 text-lg font-bold">Filter</legend>
        <GeneralMapSelector name="map"></GeneralMapSelector>
        <GeneralUserSelector name="users"></GeneralUserSelector>
        <Button type="submit" variant="outline">Update</Button>
      </form>

      <div class="flex-1 min-w-0 xl:max-w-[56rem] py-10 xl:pl-20 pr-5">

        <template v-if="results !== undefined">
          <LazyGeneralWinrateChart  :data="results.data.factionWinrate"></LazyGeneralWinrateChart>
          <LazyGeneralAverageOsToTimeChart :data="results.data.osToTime" ></LazyGeneralAverageOsToTimeChart>
          <LazyGeneralAverageOsToTimeChart :data="results.data.osToTime2" ></LazyGeneralAverageOsToTimeChart>
          <LazyGeneralAverageOsToTimeChart :data="results.data.osToTime3" ></LazyGeneralAverageOsToTimeChart>
          <!-- <BarChart -->
          <!--   :data="factionWinrate!" -->
          <!--   index="name" -->
          <!--   :categories="['ratio']" -->
          <!--   :colors="color" -->
          <!--   :y-formatter=" -->
          <!--     (tick, i) => { -->
          <!--       return typeof tick === 'number' -->
          <!--         ? `$ ${new Intl.NumberFormat('us').format(tick).toString()}` -->
          <!--         : ''; -->
          <!--     } -->
          <!--   " -->
          <!-- > -->
          <!-- </BarChart> -->
        </template>
      </div>
    </div>
  </article>
</template>
