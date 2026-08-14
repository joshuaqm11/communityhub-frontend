import { defineStore } from 'pinia';

/**
 * El endpoint GET /api/dashboard devuelve una forma distinta según el
 * rol (user/organizer/admin, ver stats.service.js del backend), por
 * eso el tipo se deja flexible aquí y cada página consume las llaves
 * que le corresponden a su rol.
 */
export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<Record<string, any> | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDashboard() {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const res = await apiFetch<{ success: boolean; data: Record<string, any> }>('/dashboard');
      data.value = res.data;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudo cargar el dashboard';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, fetchDashboard };
});
