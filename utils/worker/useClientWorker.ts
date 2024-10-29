import { isClient } from "@vueuse/core";
import { WorkerClient } from "./core/client";

export function useClientWorker<Request, Response>(
  key: string,
  workerGenerator: () => Worker,
) {
  const worker = useState<WorkerClient<Request, Response> | null>(
    key,
    () => null,
  );

  if (isClient) {
    //console.log('rerunning')
    if (worker.value === null) {
      worker.value = new WorkerClient<Request, Response>(workerGenerator());
    }
  }
  const workerClient = computed(() => {
    //if (worker.value === undefined) return undefined;
    return worker.value;
  });

  return {
    worker: workerClient,
  };
}
