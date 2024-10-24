import { initDb } from "../utils/database";

export default defineNitroPlugin(async (nitro) => {
  nitro.hooks.hook("request", () => {
    initDb(process.env.NUXT_DB_URL!, process.env.NUXT_DB_AUTH_TOKEN!);
  });
});
