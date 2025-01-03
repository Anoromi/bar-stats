import type {
  ClusterPostprocessingRequest,
  ClusterPostprocessingResult,
} from "~/utils/mapClusters/worker";
import type {
  ValueSmoothingRequest,
  ValueSmoothingResponse,
} from "~/utils/valueSmoothing/worker";
import { useClientWorker } from "~/utils/worker/useClientWorker";
import MapClusterWorker from "~/utils/mapClusters/worker?worker";
import ValueSmoothingWorker from "~/utils/valueSmoothing/worker?worker";

export function useWorkerServers() {
  return {
    smoothingWorker: useClientWorker<
      ValueSmoothingRequest,
      ValueSmoothingResponse
    >("smoothing", () => new ValueSmoothingWorker()),
    mapProcessingWorker: useClientWorker<
      ClusterPostprocessingRequest,
      ClusterPostprocessingResult
    >("mapProcessing", () => new MapClusterWorker()),
  };
}
