import { z } from "zod";
import { InterruptedException } from "./crash";
import { wait } from "~/utils/other/wait";

export type WorkerServerRequest =
  | {
      type: "create";
      id: number;
      data: unknown;
    }
  | {
      type: "cancel";
      id: number;
    }
    

export const workerServerResponseSchema = z
  .object({
    type: z.literal("success"),
    id: z.number(),
    data: z.unknown(),
  })
  .or(
    z.object({
      type: z.literal("error"),
      id: z.number(),
      message: z.unknown(),
    }),
  ).or(
  z.object({
    type: z.literal("interrupted"),
    id: z.number(),
    message: z.string()
  })
  );

export type WorkerServerResponse = z.infer<typeof workerServerResponseSchema>;

export type ExecutionContext = {
  check: () => Promise<boolean>;
};

export class WorkerServer<Request, Response> {
  constructor(
    private executor: (
      context: ExecutionContext,
      data: Request,
    ) => Promise<Response>,
  ) {}

  requestsData = new Map<
    number,
    {
      //resolve: (data: WorkerServerResponse) => void;
      //reject: (data: WorkerServerResponse) => void;
      canceled: boolean;
    }
  >();

  get listener(): (event: MessageEvent) => void {
    return (event) => {
      const data = event.data as WorkerServerRequest;
      if (typeof data.id !== "number") {
        console.error("No id for worker request provided.");
        return;
      }

      switch (data.type) {
        case "create": {
          this.requestsData.set(data.id, { canceled: false });
            this.executor(
              {
                check: () => this.checkFor(data.id),
              },
              data.data as Request,
            )
              .then((result) => this.resolveRequest(data.id, result))
              .catch((error) => this.resolveRequest(data.id, undefined, error));
          
          break;
        }
        case "cancel": {
          this.cancelRequest(data.id);
          break;
        }
      }

      //this.executor(event)
    };
  }

  cancelRequest(id: number) {
    const resolver = this.requestsData.get(id);
    if (resolver !== undefined) resolver.canceled = true;
  }

  resolveRequest(id: number, response?: Response, error?: unknown) {
    this.requestsData.delete(id);
    if(error !== undefined && error instanceof InterruptedException) {
      console.log('oh no, interrupted')
      postMessage({
        id,
        type: "interrupted",
        message: error.message,
      } satisfies WorkerServerResponse);
    }
    else if (error !== undefined) {
      console.error(error)
      postMessage({
        id,
        type: "error",
        message: error,
      } satisfies WorkerServerResponse);
    } else {
      postMessage({
        id,
        type: "success",
        data: response,
      } satisfies WorkerServerResponse);
    }
  }

  private async checkFor(id: number) {
    await wait(0);
    return this.requestsData.get(id)?.canceled ?? true;
  }
}
