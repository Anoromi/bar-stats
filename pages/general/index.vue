<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/battleProcessor/worker";
import { toast } from "~/components/ui/toast";
import Hint from "~/components/ui/hint/Hint.vue";

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
      .optional()
      .default(route.query.map as string),
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
};
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

      <div class="flex min-w-0 flex-1 flex-col gap-y-8 py-10 pr-5 xl:pl-20">
        <!-- <LazyGeneralClusterTest></LazyGeneralClusterTest> -->
        <template v-if="results !== undefined">
          <b class="block text-xl">
            Found {{ results.data.battles.length }} battles
          </b>
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
          <div class="rounded-xl bg-surface px-2 pt-4 shadow-lg">
            <Tabs default-value="average-os" class="min-h-[600px]">
              <TabsList class="flex">
                <TabsTrigger value="osdiff" class="text-base">
                  Max - Min os
                </TabsTrigger>
                <TabsTrigger value="average-os" class="text-base">
                  Average os
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
                  :x-label="'os difference'"
                >
                  <template #hint>
                    <Hint>
                      This chart reflects on how os difference in a battle
                      corresponds to battle time. Specifically, the formula used
                      is (max_player_os - min_player_os)
                    </Hint>
                  </template>
                </LazyGeneralOsToTimeChart>
              </TabsContent>
              <TabsContent value="average-os">
                <LazyGeneralOsToTimeChart
                  :data="results.data.osToTime"
                  :title="'Average os'"
                  :x-label="'average os'"
                  :max="50"
                  :min="0"
                >
                  <template #hint>
                    <Hint>
                      This chart reflects on how average os in a battle
                      corresponds to battle time. Specifically, the formula used
                      is (player1_os + player2_os + player3_os + ...) / player_count
                    </Hint>
                  </template>
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
                  <template #hint>
                    <Hint>
                      This chart reflects on how min os in a battle corresponds
                      to battle time.
                    </Hint>
                  </template>
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
                  <template #hint>
                    <Hint>
                      This chart reflects on how max os in a battle corresponds
                      to battle time.
                    </Hint>
                  </template>
                </LazyGeneralOsToTimeChart>
              </TabsContent>
            </Tabs>
          </div>
          <LazyGeneralWinrateChart
            :data="results.data.factionWinrate"
            class="rounded-xl bg-surface p-2 shadow-lg"
            title="Faction win factor"
          >
          </LazyGeneralWinrateChart>

          <LazyGeneralTeamWinrateChart
            v-if="results.data.teamWinrate !== undefined"
            :data="results.data.teamWinrate"
            class="rounded-xl bg-surface shadow-lg"
          >
          </LazyGeneralTeamWinrateChart>
        </template>
      </div>
    </div>
  </article>
</template>
