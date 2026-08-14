/**
 * Protege rutas que requieren estar autenticado (cualquier rol).
 * Uso: definePageMeta({ middleware: ['auth'] })
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const ok = await ensureSession();
  if (!ok) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
