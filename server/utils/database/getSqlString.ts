import type { SQL } from "drizzle-orm";
import { SQLiteAsyncDialect } from "drizzle-orm/sqlite-core";

export function getSqlString(sql: SQL) {
  const dialect = new SQLiteAsyncDialect();
  return dialect.sqlToQuery(sql);
}
