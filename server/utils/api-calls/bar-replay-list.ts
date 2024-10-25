import { z } from "zod";

const barReplayListSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  data: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});

export type BarReplayList = z.infer<typeof barReplayListSchema>

export async function getBarReplayList(page: number, limit: number = 100) : Promise<BarReplayList> {
  return barReplayListSchema.parse(
    await $fetch(
      "https://api.bar-rts.com/replays?" +
        new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        }).toString(),

      {
        retry: 5
      }
    ),
  );
}
