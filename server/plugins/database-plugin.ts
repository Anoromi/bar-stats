import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { updateDb } from "../utils/database";
import { migrate } from "drizzle-orm/libsql/migrator";


export default defineNitroPlugin(async (nitro) => {
  const {DB_AUTH_TOKEN, DB_URL} = useRuntimeConfig()
  const client = createClient({ url:DB_URL, authToken: DB_AUTH_TOKEN });



  //const db = drizzle(client);
  //console.log(db)


  updateDb(drizzle(client))

  //await migrate(db, {migrationsFolder: 'assets:server'})





  //console.log(db)

  //db.insert(countries).values({
  //  name: 'hehe hehe'
  //}).then(() => {
  //  console.log('ok')
  //}, error => {
  //  console.log('error', error)
  //})

  //const result = await db.select().from(users).all()

})