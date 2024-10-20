import consola from "consola";
import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import type { TypedQueryBuilder } from "drizzle-orm/query-builders/query-builder";

export async function explainAnalyze(query: SQL) {
  return await db.run(sql`EXPLAIN QUERY PLAN ${query}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function explainAnalyzeLog<T extends TypedQueryBuilder<any, any>>(
  sql: T,
) {
  consola.log(await explainAnalyze(sql.getSQL()));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logAnalyze<T extends TypedQueryBuilder<any, any>>(
  sql: T,
): Promise<T> {
  consola.log(await explainAnalyze(sql.getSQL()));
  return sql;
}
