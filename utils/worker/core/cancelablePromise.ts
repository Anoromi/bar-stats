export class CancelablePromise<T> extends Promise<T> {
  public readonly cancel: () => void;
  constructor(
    executor: (
      resolve: (value: T) => void,
      reject: (reason?: unknown) => void,
    ) => void,

    cancel: () => void
  ) {
    super(executor);
    this.cancel = cancel
  }
}
