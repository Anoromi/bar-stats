import { z } from "zod";


export function booleanQueryParam() {
  return z.enum(['true', 'false']).nullish().transform(v => v === 'true')
}
