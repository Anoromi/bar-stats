import { isClient, tryOnScopeDispose } from "@vueuse/core";
import { WorkerClient } from "./core/client";

export function useClientWorker<Request, Response>(
  url: URL,
  workerOptions?: WorkerOptions,
) {
  const worker = shallowRef<Worker>();

  if (isClient) {
    worker.value = new Worker(url, workerOptions);
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
