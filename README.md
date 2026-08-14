# CommunityHub — Frontend

Aplicación cliente construida con Nuxt 4, Vue 3, TypeScript y Pinia. Consume exclusivamente la API REST del backend (nunca se conecta directamente a MongoDB).

Este es uno de los 3 repositorios del proyecto **CommunityHub**:
- 🔧 [`communityhub-backend`](../communityhub-backend) — Express.js / MongoDB (contiene la documentación de la API en `docs/API.md`)
- 🎨 `communityhub-frontend` (este repo)
- ⚡ [`communityhub-lambda`](../communityhub-lambda) — AWS Lambda

> Actualiza los links de arriba con las URLs reales una vez creados los 3 repos remotos.

## Estado de esta entrega (Fase 2 — Frontend completo)

✅ `useApi` con JWT automático (Bearer) y manejo de 401 (limpia sesión + redirige a `/login`)
✅ Sesión persistida en cookie (`useCookie`, no localStorage) + restauración automática al recargar
✅ Stores de Pinia: `auth`, `events`, `categories`, `notifications`, `dashboard`, `users`
✅ Middleware de rutas: `auth`, `guest`, `admin`, `organizer` — autorización real en backend, esto solo evita mostrar UI indebida
✅ Las 14 páginas mínimas del enunciado + `/my-events/create`, `/my-events/:id/edit`, `/my-events/:id/participants`
✅ Búsqueda, filtros y paginación de actividades consumiendo `GET /api/events`
✅ Formularios con validación (login, registro, perfil, actividades) y mensajes de error de la API
✅ Estados de carga, vacíos y de error en todas las vistas que consumen el backend
✅ Confirmaciones (modal) antes de eliminar actividades/usuarios/categorías
✅ Dashboard con contenido distinto por rol (`user`/`organizer`/`admin`) usando datos reales de `GET /api/dashboard`
✅ Panel `/admin/*` con layout propio (sidebar) para usuarios, actividades, categorías y estadísticas
✅ Diseño responsive con CSS propio (sin dependencias nuevas)

⬜ Pendiente: PWA (Fase 3 — manifest, service worker, cache offline).

## Instalación

```bash
npm install
cp .env.example .env
# NUXT_PUBLIC_API_BASE debe apuntar al backend (http://localhost:3000/api en desarrollo)
npm run dev
```

Requiere que `communityhub-backend` esté corriendo (ver su README) y que existan categorías creadas (`npm run seed` en el backend).

## Estructura

```
communityhub-frontend/
├── app.vue                  # <NuxtLayout><NuxtPage /></NuxtLayout>
├── nuxt.config.ts
├── types/index.ts           # Interfaces TS compartidas (User, EventItem, Category, ...)
├── composables/
│   └── useApi.ts            # $fetch + JWT automático + manejo de 401
├── utils/
│   └── ensureSession.ts     # Restaura la sesión si hay token pero no hay user cargado
├── stores/
│   ├── auth.ts               # user, token (cookie), login/register/logout/fetchMe
│   ├── events.ts              # CRUD, búsqueda/filtros, inscripciones, favoritos
│   ├── categories.ts
│   ├── notifications.ts
│   ├── dashboard.ts
│   └── users.ts                # gestión admin + actualización de perfil propio
├── middleware/
│   ├── auth.ts / guest.ts / admin.ts / organizer.ts
├── plugins/
│   └── session.client.ts     # restaura sesión al iniciar la app
├── layouts/
│   ├── default.vue            # navbar + slot
│   └── admin.vue               # sidebar de administración
├── components/
│   ├── AppNavbar.vue, EventCard.vue, EventForm.vue
│   ├── LoadingSpinner.vue, EmptyState.vue, ErrorAlert.vue
│   ├── ConfirmDialog.vue, Pagination.vue, StatCard.vue
├── pages/
│   ├── index.vue, login.vue, register.vue, profile.vue, dashboard.vue, favorites.vue, my-registrations.vue
│   ├── events/index.vue, events/[id].vue
│   ├── my-events/index.vue, my-events/create.vue, my-events/[id]/edit.vue, my-events/[id]/participants.vue
│   └── admin/index.vue, admin/users.vue, admin/events.vue, admin/categories.vue, admin/statistics.vue
└── assets/css/main.css       # sistema visual propio (sin dependencias nuevas)
```

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Inicio, próximas actividades |
| `/login`, `/register` | Invitados | Autenticación (redirige si ya hay sesión) |
| `/events`, `/events/:id` | Público | Listado con filtros/búsqueda, detalle |
| `/favorites` | Autenticado | Mis actividades favoritas |
| `/my-registrations` | Autenticado | Mis inscripciones |
| `/my-events*` | Organizer/Admin | Gestión de actividades propias (crear/editar/eliminar/participantes) |
| `/profile` | Autenticado | Editar perfil propio |
| `/dashboard` | Autenticado | Contenido según rol |
| `/admin/*` | Admin | Usuarios, actividades, categorías, estadísticas |

## Notas

- El frontend **no** se conecta directamente a MongoDB; toda la data pasa por `/api/*` en el backend.
- El JWT se guarda en una cookie (`ch_token`, `sameSite: strict`) en vez de `localStorage`: funciona igual en SSR/CSR y se limpia sola. Se envía como `Authorization: Bearer <token>` en cada request, nunca de forma automática por el navegador.
- La configuración de PWA (`@vite-pwa/nuxt`, manifest, service worker, estrategia de caché offline) se agrega en la Fase 3.
