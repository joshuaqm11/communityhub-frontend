export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    // '@vite-pwa/nuxt' se agrega en la Fase 3 (PWA)
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'CommunityHub',
      meta: [
        { name: 'description', content: 'Plataforma comunitaria de actividades y eventos' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // Base de la API del backend. Se sobreescribe con NUXT_PUBLIC_API_BASE en .env
      apiBase: 'http://localhost:3000/api',
    },
  },
});
