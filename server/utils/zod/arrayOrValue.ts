import { type ZodType, z } from "zod";
import { nullIgnore } from "./nullIgnore";

export function headerArrayParam<T extends ZodType>(
  parser: T,
  removeEmpty: boolean = true,
) {
  return z.array(z.string().pipe(parser)).or(
    z
      .string()
      .transform((input) => {
        if (input === "" && removeEmpty) {
          return null;
        }
        return input;
      })
      .pipe(nullIgnore(parser))
      .transform((v) => {
        if (v === null || v === undefined) return [];
        return [v];
      }),
  );
}
