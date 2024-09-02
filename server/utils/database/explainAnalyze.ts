import consola from "consola";
import { SQL, sql } from "drizzle-orm";
import { TypedQueryBuilder } from "drizzle-orm/query-builders/query-builder";
import {
  SQLiteSelectBase,
  SQLiteSelectBuilder,
  SQLiteSelectQueryBuilderBase,
} from "drizzle-orm/sqlite-core";

export async function explainAnalyze(query: SQL) {
  return await db.run(sql`EXPLAIN QUERY PLAN ${query}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logAnalyze<T extends TypedQueryBuilder<any, any>>(
  sql: T,
): Promise<T> {
  consola.log(await explainAnalyze(sql.getSQL()));
  return sql;
}
