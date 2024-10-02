import { z } from "zod";

const playerSchema = z.object({
  id: z.number().int().nullish(),
  playerId: z.number().int().nullish(),
  name: z.string().nullish(),
  countryCode: z.string().nullish(),
  rank: z.number().int().nullish(),
  skillUncertainty: z.number().nullish(),
  skill: z
    .string()
    .refine((s) => s.startsWith("[") && s.endsWith("]"), {
      message: "Skill starts or ends with a non [ ] characters",
    })
    .transform((s) => parseInt(s.replaceAll("[", "").replaceAll("]", "")))
    .nullish(),
  userId: z.number().int().nullish(),
});

const barReplaySchema = z.object({
  id: z.string(),
  gameVersion: z.string(),
  engineVersion: z.string(),
  startTime: z.string().datetime(),
  durationMs: z.number().int(),
  fullDurationMs: z.number().int(),
  gameEndedNormally: z.boolean(),
  hasBots: z.boolean(),
  Map: z.object({
    id: z.number().int(),
    scriptName: z.string(),
    fileName: z.string().nullish(),
    width: z.number().nullish(),
    height: z.number().nullish(),
  }),
  gameSettings: z.object({
    ranked_game: z.string().refine((v) => v === "0" || v === "1", {
      message: "Value shoud be either 0 or 1",
    }),
  }),
  preset: z.string().nullish(),
  awards: z
    .object({
      econDestroyed: z.array(
        z.object({
          teamId: z.number().int(),
          value: z.number(),
        }),
      ),

      fightingUnitsDestroyed: z.array(
        z.object({
          teamId: z.number().int(),
          value: z.number(),
        }),
      ),
      resourceEfficiency: z.array(
        z.object({
          teamId: z.number().int(),
          value: z.number(),
        }),
      ),
      cow: z.object({
        teamId: z.number().transform((v) => (v === -1 ? null : v)),
      }),
      mostResourceProduced: z
        .object({
          teamId: z.number().int(),
          value: z.number(),
        })
        .optional(),
      mostDamageTaken: z.object({
        teamId: z.number().int(),
        value: z.number(),
      }),
    })
    .nullable(),

  AllyTeams: z.array(
    z.object({
      id: z.number().int(),
      allyTeamId: z.number().int(),
      startBox: z
        .object({
          bottom: z.number(),
          left: z.number(),
          top: z.number(),
          right: z.number(),
        })
        .nullable(),
      winningTeam: z.boolean(),
      Players: z.array(
        playerSchema.merge(
          z.object({
            faction: z.string(),
            teamId: z.number().int(),
            startPos: z
              .object({
                x: z.number(),
                y: z.number(),
                z: z.number(),
              })
              .nullable(),
            allyTeamId: z.number().int(),
          }),
        ),
      ),
    }),
  ),
  Spectators: z.array(playerSchema),
});

export type BarReplay = z.infer<typeof barReplaySchema>;

export async function getBarReplay(id: string) : Promise<BarReplay> {
  const result = await $fetch(`https://api.bar-rts.com/replays/${id}`, {
    retry: 4,
    retryDelay: 1000,
  });
  return barReplaySchema.parse(result);
}
