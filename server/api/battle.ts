import { z } from "zod";
import { headerArrayParam } from "../utils/zod/arrayOrValue";
import type { BattleWithPlayers } from "../utils/services/battleService";
import { booleanQueryParam } from "../utils/zod/booleanQuery";

const querySchema = z.object({
  users: headerArrayParam(z.number({ coerce: true }).int())
    .nullish()
    .default(null),
  map: z.string().nullish().default(null),
  battleType: z.string(),
  limit: z.number({ coerce: true }).nullish().default(null),
  afterBattle: z
    .string()
    .datetime()
    .transform((v) => new Date(v))
    .nullish()
    .default(null),
  osSelection: z.enum(["<=20", ">=20", ">=25"]).nullish().default(null),
  waterIsLava: booleanQueryParam(),
  rankedGame: booleanQueryParam(),
});

export type GetBattleQuery = z.input<typeof querySchema>;

const defaultLimit = 100;

export default defineCachedEventHandler<
  { query: GetBattleQuery },
  Promise<BattleWithPlayers[]>
>(
  async (event) => {
    try {
      console.log(await getQuery(event));
      const requestParams = await getValidatedQuery(event, querySchema.parse);
      console.log("requesting battles with params", requestParams);
      const battleService = useBattleService();

      let users = requestParams.users;
      if (users?.length === 0) users = null;
      let minOs: number | null = null;
      let maxOs: number | null = null;
      if (requestParams.osSelection === "<=20") {
        maxOs = 20;
      } else if (requestParams.osSelection === ">=20") {
        minOs = 20;
      } else if (requestParams.osSelection === ">=25") {
        minOs = 25;
      }

      return await battleService.getBattles({
        userIds: users,
        battleMap: requestParams.map,
        battleType: requestParams.battleType,
        limit: requestParams.limit ?? defaultLimit,
        afterBattle: requestParams.afterBattle,
        waterIsLava: requestParams.waterIsLava ?? false,
        rankedGame: requestParams.rankedGame ?? true,
        minOs: minOs,
        maxOs: maxOs,
      });
    } catch (e) {
      console.error("Error");
      console.error(e);
      throw e;
    }
  },
  {
    maxAge: import.meta.dev ? 1 : 60 * 60 * 24,
    //maxAge: 60 * 60 * 24,
  },
);
