import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./database/schema";
import { createClient } from "@libsql/client";
import consola from "consola";

// eslint-disable-next-line import/no-mutable-exports
export let db: LibSQLDatabase<typeof schema> =
  null as unknown as LibSQLDatabase<typeof schema>;

export function initDb(url: string, authToken?: string) {
  consola.log("checking db");
  if (db === null) {
    consola.log("initializing db");
    consola.log('url', url, authToken)
    try {
    const client = createClient({ url: url, authToken: authToken });
    db = drizzle(client, { schema });
    } catch (error) {
      console.error('Could not connect to database', error);
    }
  }
  return db;
}
