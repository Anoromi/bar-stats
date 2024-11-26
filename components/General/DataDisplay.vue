<script setup lang="ts">
import type { BattlesProcessorResponse } from "~/utils/battleProcessor/worker";
import Hint from "../ui/hint/Hint.vue";
import type { GeneralFormData } from "~/utils/general/formSchema";

defineProps<{
  results: BattlesProcessorResponse & { type: "battle" };
  searchParams: GeneralFormData;
}>();
</script>
<template>
  <div class="flex w-full flex-col gap-y-8 py-10 xl:ml-96 xl:pl-8">
    <div class="flex justify-between px-2">
      <b class="block text-xl">
        Found {{ results.data.battles.length }} battles
      </b>
      <GeneralShareButton :search-params="searchParams">
        Share
      </GeneralShareButton>
    </div>
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
      :position-preference="results.data.positionPreference!"
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
          <TabsTrigger value="min-os" class="text-base"> Min os </TabsTrigger>
          <TabsTrigger value="max-os" class="text-base"> Max os </TabsTrigger>
        </TabsList>
        <TabsContent value="osdiff">
          <LazyGeneralOsToTimeChart
            :data="results.data.osDiffToTime"
            :title="'Os diff'"
            :x-label="'os difference'"
          >
            <template #hint>
              <Hint>
                This chart reflects on how os difference in a battle corresponds
                to battle time. Specifically, the formula used is (max_player_os
                - min_player_os)
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
                This chart reflects on how average os in a battle corresponds to
                battle time. Specifically, the formula used is (player1_os +
                player2_os + player3_os + ...) / player_count
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
                This chart reflects on how min os in a battle corresponds to
                battle time.
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
                This chart reflects on how max os in a battle corresponds to
                battle time.
              </Hint>
            </template>
          </LazyGeneralOsToTimeChart>
        </TabsContent>
      </Tabs>
    </div>
    <LazyGeneralWinrateChart
      v-if="results.data.factionPreference"
      class="rounded-xl bg-surface p-2 shadow-lg"
      title="Faction pick"
      :data="results.data.factionPreference"
    ></LazyGeneralWinrateChart>
    <LazyGeneralWinrateChart
      :data="results.data.factionWinrate"
      class="rounded-xl bg-surface p-2 shadow-lg"
      title="Faction win rate"
    >
    </LazyGeneralWinrateChart>

    <LazyGeneralTeamWinrateChart
      v-if="results.data.teamWinrate !== undefined"
      :data="results.data.teamWinrate"
      class="rounded-xl bg-surface shadow-lg"
    >
    </LazyGeneralTeamWinrateChart>
  </div>
</template>
