/**
 * Se asegura de que, si hay un token guardado, el usuario esté cargado
 * en el auth store (por ejemplo tras recargar la página). La usan los
 * middleware de rutas protegidas (auth/admin/organizer) para evitar
 * repetir la misma lógica de "restaurar sesión" en cada uno.
 * Devuelve true si hay una sesión válida, false si no.
 */
export const ensureSession = async (): Promise<boolean> => {
  const authStore = useAuthStore();

  if (!authStore.token) return false;

  if (!authStore.user) {
    try {
      await authStore.fetchMe();
    } catch {
      return false;
    }
  }

  return !!authStore.user;
};
