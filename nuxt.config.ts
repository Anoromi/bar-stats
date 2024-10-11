import topLevelAwait from "vite-plugin-top-level-await";
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
  ],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
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
        crons: [
          {
            path: "/api/update",
            schedule: "0 0 * * *",
          },
        ],
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
      topLevelAwait({
        promiseExportName: "__tla",
        promiseImportName: (i) => `__tla_${i}`,
      }),
    ],
    //worker: {
    //  plugins: () => [wasm(), topLevelAwait()],
    //},
    optimizeDeps: {
      exclude: ["vee-validate"],
    },
  },
  runtimeConfig: {
    dbURL: "http://127.0.0.1:8080",
    dbAuthToken: "",
  },
});
