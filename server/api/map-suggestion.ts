import { z } from "zod";

const querySchema = z.object({
  name: z.string(),
});

export default defineCachedEventHandler<
  {
    query: z.infer<typeof querySchema>;
  },
  MapEntity[]
>(
  async (event) => {
    const query = querySchema.parse(getQuery(event));
    const mapService = useMapService();
    return await mapService.getMapSuggestions(query.name);
  },
  {
    maxAge: 1000 * 60 * 60,
  },
);
