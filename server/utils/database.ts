import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./database/schema";
import { createClient } from "@libsql/client";
//import consola from "consola";

// eslint-disable-next-line import/no-mutable-exports
export let db: LibSQLDatabase<typeof schema> =
  null as unknown as LibSQLDatabase<typeof schema>;

export function initDb(url: string, authToken?: string) {
  console.log("checking db");
  if (db === null) {
    console.log("initializing db");
    console.log('url', url, authToken)
    try {
    const client = createClient({ url: url, authToken: authToken });
    db = drizzle(client, { schema });
    console.log(client)
    console.log(db)
    } catch (error) {
      console.error('Could not connect to database', error);
    }
  }
  return db;
}
