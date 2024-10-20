import { z } from "zod";
import type { MapDto } from "../utils/dto/dto";
import consola from "consola";

const querySchema = z.object({
  name: z.string(),
});

export type GetMapSuggestionQuery = z.infer<typeof querySchema>

export default defineEventHandler<
  {
    query: GetMapSuggestionQuery;
  },
  Promise<MapDto[]>
>(
  async (event) => {
    try {
    consola.log("let's start")
    const query = await getValidatedQuery(event, querySchema.parse);
    const mapService = useMapService();
    return await mapService.getMapSuggestions(query.name);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  //{
  //  //maxAge: 1000 * 60 * 60,
  //},
);
