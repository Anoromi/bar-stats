import { z } from "zod";
import { headerArrayParam } from "../utils/zod/arrayOrValue";
import type { BattleWithPlayers } from "../utils/services/battleService";

const querySchema = z.object({
  users: headerArrayParam(z.number({ coerce: true }).int())
    .nullish()
    .default(null),
  map: z.string().nullish().default(null),
  battleType: z.string(),
  limit: z.number({ coerce: true }).nullish().default(null),
});

export type GetBattleQuery = z.infer<typeof querySchema>;

const defaultLimit = 100;

export default defineCachedEventHandler<
  { query: GetBattleQuery },
  Promise<BattleWithPlayers[]>
>(
  async (event) => {
    const requestParams = await getValidatedQuery(event, querySchema.parse);
    console.log("requesting battles with params", requestParams);
    const battleService = useBattleService();

    let users = requestParams.users;
    if (users?.length === 0) users = null;
    return await battleService.getBattles({
      userIds: users,
      battleMap: requestParams.map,
      battleType: requestParams.battleType,
      limit: requestParams.limit ?? defaultLimit,
    });
  },
  {
    maxAge: 60 * 60 * 24,
    swr: false,
  },
);
