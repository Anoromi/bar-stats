import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";



const allowedDataLimits = ["500", "1000", "5000"] as const satisfies unknown[];
const allowedOsOptions = [
  "<=20",
  ">=20",
  ">=25",
  ">=15",
] as const satisfies unknown[];
const binaryOptions = ["Yes", "No"] as const satisfies unknown[];

const schema = z.object({
  users: z
    .object({
      id: z.number().array(),
      name: z.string(),
      countryCode: z.string(),
    })
    .array()
    .default([]),
  map: z.string().optional(),
  limit: z.enum(allowedDataLimits).default("500"),
  startDate: z.string().date().optional(),
  battleType: z.string().default("8v8"),
  osSelection: z.enum(allowedOsOptions).optional(),
  isRanked: z.enum(binaryOptions).default("Yes"),
  waterIsLava: z.enum(binaryOptions).default("No"),
});

export const formData = {
  schema,
  allowedDataLimits,
  allowedOsOptions,
  binaryOptions
}

export type GeneralFormData = z.infer<typeof schema>
