import { z, ZodType } from "zod"


export function arrayOrValue<T extends ZodType>(parser: T) {
  type Out = T extends ZodType<infer O> ? O: never
  return parser.transform(v => [v] as Out[]).or(parser.array())
}
