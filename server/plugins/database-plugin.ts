import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { updateDb } from "../utils/database";
import * as schema from '../utils/database/schema'
import { and, eq, sql } from "drizzle-orm";
import { parse } from "vue/compiler-sfc";
import { SQLiteAsyncDialect, SQLiteDialect } from "drizzle-orm/sqlite-core";


export default defineNitroPlugin(async (nitro) => {
  const {DB_AUTH_TOKEN, DB_URL} = useRuntimeConfig()
  const client = createClient({ url:DB_URL, authToken: DB_AUTH_TOKEN });

  updateDb(drizzle(client, {schema}))
})
