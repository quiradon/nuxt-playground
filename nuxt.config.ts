// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: true,
  runtimeConfig: {
    dbName: process.env.dbName, // database name
    dbUser: process.env.dbUser,
    dbPassword: process.env.dbPassword,
    dbHost: process.env.dbHost,
  },
  modules: [
    '@nuxt/content'
  ],
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  },
  app: {
    head: {
      htmlAttrs: {
        'data-bs-theme' : 'dark'
    },
      link:[
        {
          rel: "icon",
          type: "image/png",
          href: "/favicon.ico",
        },
        {
          rel: "stylesheet",
          href: "/assets/bootstrap/bootstrap.min.css",
        },
        {
          rel: "stylesheet",
          href: "/assets/css/bs-theme-overrides.css",
        },
        {
          rel: "stylesheet",
          href: "/assets/css/animate.min.css",
        },
        {
          rel: "stylesheet",
          href: "/assets/css/styles.css",
        }

      ],
      script: [
        {
          src: "/assets/bootstrap/bootstrap.min.js",
          crossorigin: "anonymous"
        }
      ]

    }
 }


})