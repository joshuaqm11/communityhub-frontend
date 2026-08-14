/**
 * Protege las rutas /admin/*: requiere sesión activa y role === 'admin'.
 * La autorización real vive en el backend (authorize('admin')); este
 * middleware solo evita mostrar la UI a quien no debería verla.
 * Uso: definePageMeta({ middleware: ['admin'], layout: 'admin' })
 */
export default defineNuxtRouteMiddleware(async () => {
  const ok = await ensureSession();
  if (!ok) return navigateTo('/login');

  const authStore = useAuthStore();
  if (authStore.user?.role !== 'admin') {
    return navigateTo('/dashboard');
  }
});
