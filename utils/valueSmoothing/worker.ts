import type { MovingAverageOptions } from "~/rstar/pkg/bar_stats_wasm";
import { WorkerServer } from "../worker/core/server";
import {
  smoothValues,
  type ValueToTimeMapping,
} from "../battleProcessor/osToTime";

export type ValueSmoothingRequest =
  | {
      type: "init";
      data: ValueToTimeMapping;
    }
  | {
      type: "process";
      data: {
        smoothingLength: number;
        smoothingOption: MovingAverageOptions;
      };
    };

export type ValueSmoothingResponse =
  | {
      type: "init";
    }
  | {
      type: "process";
      data: {
        smoothedData: [number, number][];
      };
    };

let osValues: ValueToTimeMapping | null = null;

const worker = new WorkerServer<ValueSmoothingRequest, ValueSmoothingResponse>(
  async (_context, { type, data }) => {
    console.log('smoothing worker received', data)
    switch (type) {
      case "init": {
        console.log('received')
        osValues = data;
        console.log('returning')
        return {
          type: "init",
        };
      }

      case "process": {
        return {
          type: "process",
          data: {
            smoothedData: await smoothValues(
              osValues!.values,
              osValues!.times,
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
