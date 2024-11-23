<script setup lang="ts">
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/battleProcessor/worker";
import type { GeneralFormData } from "~/utils/general/formSchema";
import type { CancelablePromise } from "~/utils/worker/core/cancelablePromise";
import BattleProcessorWorker from "~/utils/battleProcessor/worker?worker";
import { useClientWorker } from "~/utils/worker/useClientWorker";

const route = useRoute();

const { worker, restart: restartWorker } = useClientWorker<
  BattlesProcessorRequest,
  BattlesProcessorResponse
>("battleProcessor", () => new BattleProcessorWorker());

const pendingParams = shallowRef<unknown>(null);
const pendingPromise =
  shallowRef<CancelablePromise<BattlesProcessorResponse> | null>(null);
const results = ref<BattlesProcessorResponse>();

async function onSubmit(data: GeneralFormData): Promise<void> {
  const currentRequest: BattlesProcessorRequest = {
    type: "battle",
    params: {
      battleType: data.battleType!,
      map: data.map ?? null,
      users: data.users?.flatMap((v) => v.id) ?? null,
      limit: data.limit !== undefined ? parseInt(data.limit) : null,
      afterBattle: null,
      osSelection: data.osSelection ?? null,
      waterIsLava: data.waterIsLava === "Yes",
      rankedGame: data.isRanked === "Yes",
    },
  } as const;
  pendingParams.value = currentRequest;
  restartWorker();
  const request = worker.value!.request(currentRequest);
  const response = await request;
  if (pendingParams.value === currentRequest) {
    results.value = response;
    pendingPromise.value = null;
  }
}

const pageQuery = route.query as GeneralPageQuery;
const initialData: Partial<GeneralFormData> = {
  map: pageQuery.map,
  battleType: pageQuery.battleType ?? undefined,
};
</script>

<script lang="ts">
export type GeneralPageQuery = {
  map: string;
  battleType: string | null;
};
</script>

<template>
  <article class="flex flex-1 flex-col items-center p-4">
    <div class="flex w-full flex-1 flex-col xl:flex-row xl:justify-center">
      <GeneralForm
        :initial-values="initialData"
        :on-submit="onSubmit"
        :center="pendingParams === null && results === undefined"
      >
      </GeneralForm>
      <LazyGeneralDataDisplay
        v-if="results !== undefined && results.data.battles.length > 0"
        :results="results"
      >
      </LazyGeneralDataDisplay>
      <div
        v-else-if="results !== undefined"
        class="ml-[32rem] mt-20 flex w-full text-2xl font-bold"
      >
        No battles were found for these settings. <br />
        Try setting a different battle type, or chose a different map.
      </div>
      <div v-else class="flex-1"></div>
    </div>
  </article>
</template>
