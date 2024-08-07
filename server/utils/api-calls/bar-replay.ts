import { z } from "zod"

const playerSchema = z.object({
  id: z.number().int(),
  playerId: z.number().int(),
  name: z.string(),
  countryCode: z.string().nullable(),
  rank: z.number().int(),
  skillUncertainty: z.number().nullable(),
  skill: z.string()
    .refine((s) => s.startsWith('[') && s.endsWith(']'), {
      message: "Skill starts or ends with a non [ ] characters"
    })
    .transform((s) => parseInt(s.replaceAll('[', '').replaceAll(']', ''))).nullable(),
  userId: z.number().int()
})


const barReplaySchema = z.object({
  id: z.string(),
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
    height: z.number().nullish()
  }),
  gameSettings: z.object({
    ranked_game: z.string().refine(v => v === '0' || v === '1', {
      message: 'Value shoud be either 0 or 1'
    })
  }),
  awards: z.object({
    econDestroyed: z.array(z.object({
      teamId: z.number().int(),
      value: z.number()
    })),

    fightingUnitsDestroyed: z.array(z.object({
      teamId: z.number().int(),
      value: z.number()
    })),
    resourceEfficiency: z.array(z.object({
      teamId: z.number().int(),
      value: z.number()
    })),
    cow: z.object({ teamId: z.number().transform(v => v === -1 ? null : v) }),
    mostResourceProduced: z.object({
      teamId: z.number().int(),
      value: z.number()
    }).optional(),
    mostDamageTaken: z.object({
      teamId: z.number().int(),
      value: z.number()
    }),

  }).nullable(),

  AllyTeams: z.array(
    z.object({
      id: z.number().int(),
      allyTeamId: z.number().int(),
      startBox: z.object({
        bottom: z.number(),
        left: z.number(),
        top: z.number(),
        right: z.number(),
      }).nullable(),
      winningTeam: z.boolean(),
      Players: z.array(
        playerSchema.merge(z.object({
          teamId: z.number().int(),
          startPos: z.object({
            x: z.number(),
            y: z.number(),
            z: z.number()
          }).nullable(),
          allyTeamId: z.number().int(),
        }))
      )

    })
  ),
  Spectators: z.array(playerSchema)
})



export async function getBarReplay(id: string) {
  const result = await $fetch(`https://api.bar-rts.com/replays/${id}`, {
    retry: 4,
    retryDelay: 1000
  })
  //console.log(id)
  return barReplaySchema.parse(result)
}