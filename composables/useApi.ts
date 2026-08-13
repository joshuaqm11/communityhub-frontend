/**
 * Wrapper mínimo sobre $fetch apuntando a la API del backend.
 * La lógica de autenticación (guardar/enviar el token JWT) se
 * implementará junto con las páginas de login/registro.
 */
export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase,
  });

  return { apiFetch };
};
