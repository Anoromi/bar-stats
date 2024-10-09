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
  ],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  components: [
    {
      path: "~/components/other",
      pathPrefix: false
    },
    {
      path: "~/components",
    }
  ],
  nitro: {
    experimental: {
      openAPI: true
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
    charts: ['BarChart', 'MapChart', "LineChart", "ScatterChart"],
    components: ["DatasetComponent", "TitleComponent", "GridComponent", "TooltipComponent", "GraphicComponent", "GeoComponent"],
    //renderer: ['svg', 'canvas']
  },
  vite: {
    optimizeDeps: {
      exclude: ['vee-validate']
    }
  },
  runtimeConfig: {
    dbURL: "http://127.0.0.1:8080",
    dbAuthToken: "",
  },
});
