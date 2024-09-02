import {defineConfig} from 'drizzle-kit'
import { env, isDevelopment, isProduction } from "std-env";

console.log(env.NUXT_DB_URL, env.NUXT_DB_AUTH_TOKEN)
export default defineConfig({
  schema: 'server/utils/database/schema.ts',
  dialect: 'sqlite',
  driver: 'turso',
  //out: 'server/assets/drizzle',
  out : "./drizzle",
  dbCredentials: {
    url: env.NUXT_DB_URL!,
    authToken: env.NUXT_DB_AUTH_TOKEN!,


  },
})
