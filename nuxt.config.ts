import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/image",
    "nuxt-echarts",
    "@nuxt/test-utils/module",
    "@nuxt/content",
  ],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  imports: {
    dirs: ["./composables"],
  },
  experimental: {
    typedPages: true,
  },
  components: [
    {
      path: "~/components/other",
      pathPrefix: false,
    },
    {
      path: "~/components",
    },
  ],
  nitro: {
    experimental: {
      openAPI: true,
    },
    vercel: {
      config: {
        //crons: [
        //  {
        //    path: "/api/syncDatabase?highLength=false",
        //    schedule: "0 * * * *",
        //  },
        //],
      },
    },
    serverAssets: [
      {
        baseName: "drizzle2",
        dir: "./drizzle",
      },
    ],
  },
  echarts: {
    charts: ["BarChart", "MapChart", "LineChart", "ScatterChart"],
    components: [
      "DatasetComponent",
      "TitleComponent",
      "GridComponent",
      "TooltipComponent",
      "GraphicComponent",
      "GeoComponent",
      "LegendComponent",
      "ToolboxComponent",
    ],
    //renderer: ['svg', 'canvas']
  },

  vite: {
    esbuild: {
      //target: 'esnext'
      //target: ''
      //supported: {
      //  "top-level-await": true,
      //},
    },

    plugins: [
      wasm(),
      topLevelAwait({
        promiseExportName: "__tla",
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    worker: {
      format: "es",
      plugins: () => [wasm(), topLevelAwait()],
    },
    optimizeDeps: {
      exclude: ["vee-validate"],
    },
  },
  runtimeConfig: {
    NUXT_DB_URL: "http://127.0.0.1:8080",
    NUXT_DB_AUTH_TOKEN: "",
  },
  routeRules: {
    "/": { prerender: true },
    "/general": { prerender: true },
    "/blog": { isr: true },
  },
  content: {
    navigation: {
      fields: ["author", "publishedAt"],
    },
  },
});
