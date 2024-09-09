import { z } from "zod";
import { arrayOrValue } from "../utils/zod/arrayOrValue";
import type { BattleWithPlayers } from "../utils/services/battleService";
import consola from "consola";

const querySchema = z.object({
  users: arrayOrValue(z.number({coerce: true}).int()).nullish().default(null),
  map: z.string().nullish().default(null),
  battleType: z.string().nullish().default(null),
  limit: z.number({coerce: true}).nullish().default(null)
});

export type GetBattleQuery = z.infer<typeof querySchema>

const defaultLimit = 100;

export default defineEventHandler<
  { query: GetBattleQuery },
  Promise<BattleWithPlayers[]>
>(async (event) => {
  consola.log(getQuery(event))
  const requestParams = await getValidatedQuery(event, querySchema.parse);
  const battleService = useBattleService();

  return await battleService.getBattles(
    requestParams.users,
    requestParams.map,
    requestParams.battleType,
    requestParams.limit ?? defaultLimit,
  );
});
