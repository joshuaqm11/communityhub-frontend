/**
 * Protege las rutas de gestión de "mis actividades": requiere sesión
 * activa y role 'organizer' o 'admin' (un usuario normal no puede
 * crear actividades).
 * Uso: definePageMeta({ middleware: ['organizer'] })
 */
export default defineNuxtRouteMiddleware(async () => {
  const ok = await ensureSession();
  if (!ok) return navigateTo('/login');

  const authStore = useAuthStore();
  if (!['organizer', 'admin'].includes(authStore.user?.role ?? '')) {
    return navigateTo('/dashboard');
  }
});
