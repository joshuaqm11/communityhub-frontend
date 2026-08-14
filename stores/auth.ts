import { defineStore } from 'pinia';
import type { User } from '~/types';

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture?: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  // El JWT se persiste en una cookie (no localStorage): funciona igual
  // en SSR/CSR, se limpia sola al expirar (maxAge = JWT_EXPIRES_IN por
  // defecto del backend, 7 días) y evita accesos vía document.cookie
  // desde scripts de terceros al no fijar HttpOnly=false explícito de
  // más (es la opción razonable para una SPA que envía el token como
  // Bearer en cada request, no como cookie automática).
  const token = useCookie<string | null>('ch_token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'strict',
    default: () => null,
  });

  const user = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let fetchMePromise: Promise<void> | null = null;

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  function clearSession() {
    user.value = null;
    token.value = null;
  }

  async function register(payload: RegisterPayload) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const res = await apiFetch<{ success: boolean; data: { user: User; token: string } }>('/auth/register', {
        method: 'POST',
        body: payload,
      });
      token.value = res.data.token;
      user.value = res.data.user;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudo completar el registro';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const res = await apiFetch<{ success: boolean; data: { user: User; token: string } }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      token.value = res.data.token;
      user.value = res.data.user;
    } catch (err: any) {
      error.value = err?.data?.message || 'Correo o contraseña incorrectos';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Recupera el usuario autenticado a partir del token guardado.
   * Se usa al recargar la página para restaurar la sesión. Deduplica
   * llamadas concurrentes (por ejemplo si el plugin de sesión y un
   * middleware la disparan casi al mismo tiempo).
   */
  async function fetchMe() {
    if (!token.value) return;
    if (fetchMePromise) return fetchMePromise;

    loading.value = true;
    const { apiFetch } = useApi();

    fetchMePromise = apiFetch<{ success: boolean; data: { user: User } }>('/auth/me')
      .then((res) => {
        user.value = res.data.user;
      })
      .catch((err) => {
        clearSession();
        throw err;
      })
      .finally(() => {
        loading.value = false;
        fetchMePromise = null;
      });

    return fetchMePromise;
  }

  async function logout() {
    try {
      if (token.value) {
        const { apiFetch } = useApi();
        await apiFetch('/auth/logout', { method: 'POST' });
      }
    } catch {
      // Si el logout en el servidor falla igual limpiamos la sesión local:
      // JWT es stateless, lo importante es descartar el token del cliente.
    } finally {
      clearSession();
    }
  }

  return { token, user, loading, error, isAuthenticated, register, login, fetchMe, logout, clearSession };
});
