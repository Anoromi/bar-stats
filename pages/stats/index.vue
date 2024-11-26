<script setup lang="ts">
import type { GeneralFormData } from "~/utils/general/formSchema";
import type {
  BattlesProcessorRequest,
  BattlesProcessorResponse,
} from "~/utils/battleProcessor/worker";
import type { CancelablePromise } from "~/utils/worker/core/cancelablePromise";
import BattleProcessorWorker from "~/utils/battleProcessor/worker?worker";
import { useClientWorker } from "~/utils/worker/useClientWorker";

const route = useRoute();
const router = useRouter();

const pageQuery = route.query as GeneralPageQuery;
let initialData: Partial<GeneralFormData>;
if (pageQuery.search != undefined) {
  initialData = JSON.parse(atob(pageQuery.search));
} else {
  initialData = {
    map: pageQuery.map,
    battleType: pageQuery.battleType,
  };
}

const { worker, restart: restartWorker } = useClientWorker<
  BattlesProcessorRequest,
  BattlesProcessorResponse
>("battleProcessor", () => new BattleProcessorWorker());

const pendingParams = shallowRef<BattlesProcessorRequest | null>(null);
const pendingPromise =
  shallowRef<CancelablePromise<BattlesProcessorResponse> | null>(null);
const results = ref<{
  params: GeneralFormData;
  response: BattlesProcessorResponse;
}>();

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
  };
  pendingParams.value = currentRequest;
  restartWorker();
  const request = worker.value!.request(currentRequest);
  const response = await request;
  if (pendingParams.value === currentRequest) {
    results.value = {
      response,
      params: data,
    };
    pendingPromise.value = null;
  }
}

onMounted(() => {
  if (route.query.preload !== undefined) {
    onSubmit(initialData as unknown as GeneralFormData);
    router.replace({
      path: "/stats",
      query: {
        ...route.query,
        preload: undefined,
      },
    });
  }
});
</script>

<script lang="ts">
export type GeneralPageQuery = {
  map: string;
  battleType: string | undefined;
  state: string | undefined;
  search: string | undefined;
  preload: string | undefined;
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
        v-if="results !== undefined && results.response.data.battles.length > 0"
        :results="results.response"
        :search-params="results.params"
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
