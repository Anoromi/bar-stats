export function generateParams<T>(
  ...values: [keyof T, string | unknown | null | undefined][]
): Record<keyof T, string> {
  const result = {} as Record<keyof T, string>;
  for (const [key, value] of values) {
    if (value !== undefined && value !== null) result[key] = String(value);
  }
  return result;
}

export function generateURLParams<T>(
  ...values: [keyof T & string, string | unknown | null | undefined][]
): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of values) {
    if (value !== undefined && value !== null)
      searchParams.append(key, String(value));
  }
  return searchParams;
}
