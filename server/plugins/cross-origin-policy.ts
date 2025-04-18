export default defineNitroPlugin(async (nitro) => {
  nitro.hooks.hook("request", async (v) => {
    // setHeader(v, "Cross-Origin-Embedder-Policy", "require-corp");
    // setHeader(v, "Cross-Origin-Opener-Policy", "same-origin");
  });
});
