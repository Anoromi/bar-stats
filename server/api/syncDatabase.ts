import consola from "consola";
import { useSyncService } from "../utils/services/syncService";
import { z } from "zod";

const querySchema = z.object({
  highLength: z.enum(['true', 'false']).nullish().default('true')
})

export default defineEventHandler<
{
  query: z.infer<typeof querySchema>
}
>(async (event) => {
  consola.log("start syncup");
  const queryParams = await getValidatedQuery(event, querySchema.parse)
  let parsePageSize: number
  
  if(queryParams.highLength === 'true') {
    parsePageSize = 70
  }
  else {
    parsePageSize = 20
  }

  await useSyncService().syncDatabase(parsePageSize);
  consola.log("finished syncup");
});
