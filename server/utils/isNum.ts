export function isNumber(value: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return value.trim() !== "" && value !== null && isFinite(value as any);
}
