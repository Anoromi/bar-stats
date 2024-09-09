import { initDb } from "../utils/database";

export default defineNitroPlugin(async (nitro) => {
  const { DB_AUTH_TOKEN, DB_URL } = useRuntimeConfig();
  nitro.hooks.hook("request", () => {
    initDb(DB_URL, DB_AUTH_TOKEN);
  });
});
