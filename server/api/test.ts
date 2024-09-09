import * as z from "zod";

// eslint-disable-next-line unused-imports/no-unused-vars
const requestQuery = z.object({
  user: z.string().optional(),
});

export type TestRequestQuery = z.infer<typeof requestQuery>;

export default defineEventHandler(async () => {
  const mapService = useMapService()
  return mapService.getMapsByMapId([549])
  // const replayId = "d0e1c466087b6c51339fd86cd55b4431";
  //
  // const query = getMapsByMapIdQuery([23, 23]);
  // //new SQLiteAsyncDialect()
  //
  // //new SQL(query.toSQL)
  //
  //consola.log(query.toSQL());
  //const explanation = await db.run(sql`EXPLAIN QUERY PLAN ${query}`)
  //consola.log(explanation)
  //const request = await getBarReplay(replayId);
});

//function queryToSql(query: Query) {
//  return sql(query.sql, query.params)
//}
