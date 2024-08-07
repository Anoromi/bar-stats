import { LibSQLDatabase } from "drizzle-orm/libsql";


export let db : LibSQLDatabase<any>



export function updateDb(newDb: LibSQLDatabase<any>) {
  db = newDb
}