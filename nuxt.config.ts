export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

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
        { name: 'theme-color', content: '#2f5fd7' },
      ],
      link: [{ rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-180x180.png' }],
    },
  },

  // PWA (Fase 3). Estrategia generateSW: @vite-pwa/nuxt genera el
  // service worker automáticamente a partir de esta configuración
  // declarativa (precache del build + reglas de runtime caching). No
  // se usa injectManifest porque no necesitamos lógica de SW a medida,
  // solo cachear el build y las respuestas GET de la API.
  pwa: {
    registerType: 'prompt',
    includeAssets: ['favicon.ico', 'icons/apple-touch-icon-180x180.png'],
    manifest: {
      name: 'CommunityHub',
      short_name: 'CommunityHub',
      description: 'Plataforma comunitaria de actividades y eventos',
      start_url: '/',
      display: 'standalone',
      background_color: '#f5f7fb',
      theme_color: '#2f5fd7',
      icons: [
        { src: 'icons/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: 'icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      navigateFallback: '/',
      runtimeCaching: [
        {
          // Actividades: NetworkFirst -> intenta red primero (datos
          // frescos); si no hay red en <=4s, sirve la última respuesta
          // cacheada. Esto es lo que permite consultar "actividades
          // previamente consultadas" sin conexión (sección 21).
          urlPattern: ({ url }) => url.pathname.startsWith('/api/events'),
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'ch-events-api',
            networkTimeoutSeconds: 4,
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/categories'),
          handler: 'NetworkFirst',
          method: 'GET',
          options: {
            cacheName: 'ch-categories-api',
            networkTimeoutSeconds: 4,
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Imágenes de actividades (URLs externas incluidas): que las
          // tarjetas ya vistas se sigan viendo igual estando offline.
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'ch-images',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
      ],
    },
    devOptions: {
      // Permite probar el service worker con "npm run dev". Para la
      // demostración final es más confiable "npm run build && npm run
      // preview" (build real), ver README.
      enabled: true,
      type: 'module',
    },
  },

  runtimeConfig: {
    public: {
      // Base de la API del backend. Se sobreescribe con NUXT_PUBLIC_API_BASE en .env
      apiBase: 'http://localhost:3000/api',
    },
  },
});
