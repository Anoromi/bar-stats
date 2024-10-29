import { CancelablePromise } from "./cancelablePromise";
import { InterruptedException } from "./crash";
import { workerServerResponseSchema, type WorkerServerRequest } from "./server";

export class WorkerClient<Request, Response> {
  private unfinishedRequests: Map<
    number,
    {
      resolve: (data: Response) => void;
      reject: (data: unknown) => void;
    }
  > = new Map();
  private maxId: number = 0;

  constructor(private worker: Worker) {
    this.unfinishedRequests = new Map();
    worker.onmessage = (e) => this.resolveRequest(e);
  }

  private nextId() {
    return this.maxId++;
  }

  request(data: Request): CancelablePromise<Response> {
    const nextId = this.nextId();
    this.worker.postMessage({
      id: nextId,
      type: "create",
      data,
    } satisfies WorkerServerRequest);
    return new CancelablePromise(
      (res, rej) => {
        this.unfinishedRequests.set(nextId, {
          resolve: res,
          reject: rej,
        });
      },
      () => {
        this.worker.postMessage({
          id: nextId,
          type: "cancel",
        } satisfies WorkerServerRequest);
      },
    );
  }

  private resolveRequest(event: MessageEvent<unknown>): void {
    const data = workerServerResponseSchema.parse(event.data);
    const request = this.unfinishedRequests.get(data.id);
    if (request === undefined) {
      console.error(`Request ${data.id} was finished before response arrived`);
      return;
    }
    this.unfinishedRequests.delete(data.id);
    if (data.type === "success") {
      request.resolve(data.data as Response);
    } else if (data.type === "interrupted") {
      request.reject(new InterruptedException(data.message));
    } else {
      request.reject(data.message);
    }
  }
}
