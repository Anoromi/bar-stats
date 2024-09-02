import { z } from "zod";
import { arrayOrValue } from "../utils/zod/arrayOrValue";

const querySchema = z.object({
  users: arrayOrValue(z.coerce.number().int()).nullish().default(null),
  maps: z.string().nullish().default(null),
  // TODO add limit boundary
  limit: z.coerce.number().int().nullish(),
});

const defaultLimit = 100;

export default defineEventHandler<{ query: z.infer<typeof querySchema> }>(
  async (event) => {
    const requestParams = querySchema.parse(getQuery(event));
    const battleService = useBattleService();

    // await logAnalyze(getMapsQuery([2]))
    // await logAnalyze(getMapsByMapIdQuery([2, 21]))

    await battleService.getBattles(
      requestParams.users,
      requestParams.maps,
      requestParams.limit ?? defaultLimit,
    );

    return 3;
  },
);
