// https://nuxt.com/docs/api/configuration/nuxt-config


export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  nitro: {
    vercel: {
      config: {
        crons: [
          {
            path: '/api/update',
            schedule: '0 0 * * *'
          }
        ]
      }
    }
  },


  runtimeConfig: {
    DB_AUTH_TOKEN: '',
    DB_URL: ''
  }

})