export function lazy<T>(execute: () => T) {
  return {
    value: undefined as T | undefined,
    hasValue: false,
    get() {
      if (!this.hasValue) this.value = execute();
      return this.value!;
    },
  };
}
