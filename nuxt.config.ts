// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxt/fonts",
    "@nuxt/image",
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
  vite: {
    optimizeDeps: {
      exclude: ['vee-validate']
    }
  },
  runtimeConfig: {
    DB_AUTH_TOKEN: "",
    DB_URL: "http://127.0.0.1:8080",
  },
});
