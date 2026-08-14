import { defineStore } from 'pinia';
import type { User, Pagination } from '~/types';

interface FetchUsersParams {
  page?: number;
  role?: string;
  search?: string;
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const pagination = ref<Pagination>({ total: 0, page: 1, limit: 10, pages: 1 });
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers(params: FetchUsersParams = {}) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const query: Record<string, string> = {};
      if (params.page) query.page = String(params.page);
      if (params.role) query.role = params.role;
      if (params.search) query.search = params.search;

      const res = await apiFetch<{ success: boolean; data: { users: User[]; pagination: Pagination } }>('/users', {
        query,
      });
      users.value = res.data.users;
      pagination.value = res.data.pagination;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudieron cargar los usuarios';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateUser(
    id: string,
    payload: Partial<Pick<User, 'firstName' | 'lastName' | 'profilePicture' | 'role'>>
  ) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { user: User } }>(`/users/${id}`, {
      method: 'PUT',
      body: payload,
    });
    const idx = users.value.findIndex((u) => u._id === id);
    if (idx !== -1) users.value[idx] = res.data.user;
    return res.data.user;
  }

  async function deleteUser(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    users.value = users.value.filter((u) => u._id !== id);
  }

  return { users, pagination, loading, error, fetchUsers, updateUser, deleteUser };
});
