export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("render:html", async (v) => {
    const script = await useStorage("assets:server").getItem("color.js");
    v.head.push(`<script>${script}</script>`);
  });
});
