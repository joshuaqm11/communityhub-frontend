/**
 * Wrapper sobre $fetch apuntando a la API del backend.
 *
 * - Adjunta automáticamente el JWT (Authorization: Bearer <token>) en
 *   cada request si hay una sesión activa.
 * - Si el backend responde 401 (token inválido/expirado), limpia la
 *   sesión local y redirige a /login. Así cualquier página o store que
 *   use useApi() queda protegida contra tokens vencidos sin tener que
 *   repetir esa lógica en cada composable/store.
 */
export const useApi = () => {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (authStore.token) {
        const headers = new Headers(options.headers as HeadersInit);
        headers.set('Authorization', `Bearer ${authStore.token}`);
        options.headers = headers;
      }
    },
    onResponseError({ response }) {
      if (response.status === 401 && import.meta.client) {
        authStore.clearSession();
        navigateTo('/login');
      }
    },
  });

  return { apiFetch };
};
