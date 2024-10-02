import type { ZodType } from "zod";
import { z } from "zod";

export function nullIgnore<T extends ZodType>(parser: T) {
  return z.null().or(z.undefined()).or(parser);
}
