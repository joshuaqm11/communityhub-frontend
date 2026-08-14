/**
 * Para /login y /register: si ya hay una sesión activa, redirige al
 * dashboard en vez de mostrar el formulario de nuevo.
 * Uso: definePageMeta({ middleware: ['guest'] })
 */
export default defineNuxtRouteMiddleware(async () => {
  const ok = await ensureSession();
  if (ok) {
    return navigateTo('/dashboard');
  }
});
