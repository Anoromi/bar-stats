
export function generateParams<T>(
  ...values: [keyof T, string | unknown | null | undefined][]
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  for (const [key, value] of values) {
    if (value !== undefined && value !== null) result[key] = String(value);
  }
  return result;
}
