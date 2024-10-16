import { z } from "zod";
import type { MapDto } from "../utils/dto/dto";

const querySchema = z.object({
  mapId: z.number({coerce: true}).int(),
});

export type GetMapQuery = z.infer<typeof querySchema>;

export default defineEventHandler<
  { query: GetMapQuery },
  Promise<MapDto | null>
>(async (event) => {
  const query = await getValidatedQuery(event, querySchema.parse);
  const map = useMapService();
  return (await map.getMapsByMapId([query.mapId])).at(0) ?? null;
});
