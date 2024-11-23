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
    if (worker.value === null) {
      worker.value = new WorkerClient<Request, Response>(workerGenerator());
    }
  }
  const workerClient = computed(() => {
    return worker.value;
  });

  function restart() {
    worker.value?.dispose();
    worker.value = new WorkerClient<Request, Response>(workerGenerator());
  }

  return {
    worker: workerClient,
    restart,
  };
}
