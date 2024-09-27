import { initDb } from "../utils/database";

export default defineNitroPlugin(async (nitro) => {
  const { dbURL, dbAuthToken } = useRuntimeConfig();
  nitro.hooks.hook("request", () => {
    initDb(dbURL, dbAuthToken);
  });
});
