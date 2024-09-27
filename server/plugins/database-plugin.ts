import { initDb } from "../utils/database";

export default defineNitroPlugin(async (nitro) => {
  const { dbURL, dbAuthToken } = useRuntimeConfig();
  console.log('process', process.env.DB_URL, process.env.DB_AUTH_TOKEN);
  nitro.hooks.hook("request", () => {
    initDb(process.env.DB_URL!, process.env.DB_AUTH_TOKEN!);
  });
});
