/**
 * Al cargar la app en el navegador, si hay un token guardado pero
 * todavía no se cargó el usuario (por ejemplo tras recargar la
 * página), se intenta restaurar la sesión inmediatamente para que la
 * navbar y las páginas públicas ya muestren el estado correcto sin
 * esperar a que el usuario navegue a una ruta protegida.
 *
 * Es solo un adelanto: los middleware de rutas protegidas
 * (auth/admin/organizer) hacen la misma verificación de forma
 * defensiva por si esta llamada aún no terminó.
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();

  if (authStore.token && !authStore.user) {
    authStore.fetchMe().catch(() => {
      // Token inválido/expirado: fetchMe ya limpia la sesión.
    });
  }
});
