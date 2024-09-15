import { isClient, tryOnScopeDispose } from "@vueuse/core";
import { WorkerClient } from "./core/client";

export function useClientWorker<Request, Response>(
  workerGenerator: () => Worker
) {
  const worker = shallowRef<Worker>();

  if (isClient) {
  // url: URL,
  // workerOptions?: WorkerOptions,
    worker.value = workerGenerator();
  }
  const workerClient = computed(() => {
    if (worker.value === undefined) return undefined;
    return new WorkerClient<Request, Response>(worker.value);
  });

  tryOnScopeDispose(() => {
    worker.value?.terminate();
  });

  return {
    worker: workerClient,
  };
}
