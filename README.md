# CommunityHub — Frontend

Aplicación cliente construida con Nuxt 4, Vue 3, TypeScript y Pinia. Consume exclusivamente la API REST del backend (nunca se conecta directamente a MongoDB).

Este es uno de los 3 repositorios del proyecto **CommunityHub**:
- 🔧 [`communityhub-backend`](../communityhub-backend) — Express.js / MongoDB (contiene la documentación de la API en `docs/API.md`)
- 🎨 `communityhub-frontend` (este repo)
- ⚡ [`communityhub-lambda`](../communityhub-lambda) — AWS Lambda

> Actualiza los links de arriba con las URLs reales una vez creados los 3 repos remotos.

## Estado de esta entrega

✅ Herramienta FE inicializada: Nuxt 4 + TypeScript + Pinia configurados
✅ `runtimeConfig` apuntando a la API del backend (`NUXT_PUBLIC_API_BASE`)
✅ Composable base (`useApi`) para consumir el backend
✅ Estructura de carpetas creada (`pages/`, `components/`, `stores/`, `composables/`, `public/`)

⬜ Pendiente (próxima entrega): páginas (login, registro, actividades, dashboard, admin), store de autenticación, Web App Manifest + Service Worker (PWA), funcionalidad offline.

## Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

## Estructura

```
frontend/
├── app.vue
├── nuxt.config.ts
├── pages/          # (vacío) próxima entrega
├── components/      # (vacío) próxima entrega
├── stores/          # (vacío) store de auth con Pinia, próxima entrega
├── composables/
│   └── useApi.ts    # wrapper de $fetch hacia el backend
├── public/          # (vacío) icons + manifest.webmanifest, próxima entrega
└── package.json
```

## Notas

- El frontend **no** debe conectarse directamente a MongoDB; toda la data pasa por `/api/*` en el backend.
- La configuración de PWA (`@vite-pwa/nuxt`, manifest, service worker, estrategia de caché offline) se agrega junto con las primeras páginas para evitar configurar caché sobre rutas que aún no existen.
