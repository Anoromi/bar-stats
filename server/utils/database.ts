import { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from './database/schema'

export let db : LibSQLDatabase<typeof schema>



export function updateDb(newDb: LibSQLDatabase<typeof schema>) {
  db = newDb
}
