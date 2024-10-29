import type { MovingAverageOptions } from "~/rstar/pkg/bar_stats_wasm";
import { WorkerServer } from "../worker/core/server";
import {
  smoothValues,
  type ValueToTimeMapping,
} from "../battleProcessor/osToTime";

export type ValueSmoothingRequest =
  | {
      type: "process";
      data: {
        smoothingLength: number;
        smoothingOption: MovingAverageOptions;
        mapping: ValueToTimeMapping;
      };
    };

export type ValueSmoothingResponse =
  | {
      type: "process";
      data: {
        smoothedData: [number, number][];
      };
    };

const worker = new WorkerServer<ValueSmoothingRequest, ValueSmoothingResponse>(
  async (_context, { type, data }) => {
    console.log("smoothing worker received", data);
    switch (type) {
      case "process": {
        return {
          type: "process",
          data: {
            smoothedData: await smoothValues(
              data.mapping.values,
              data.mapping.times,
              data.smoothingLength,
              data.smoothingOption,
            ),
          },
        };
      }
    }
  },
);

onmessage = worker.listener;
