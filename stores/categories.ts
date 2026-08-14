import { defineStore } from 'pinia';
import type { Category } from '~/types';

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories() {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const res = await apiFetch<{ success: boolean; data: { categories: Category[] } }>('/categories');
      categories.value = res.data.categories;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudieron cargar las categorías';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(payload: { name: string; description?: string }) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { category: Category } }>('/categories', {
      method: 'POST',
      body: payload,
    });
    categories.value.push(res.data.category);
    return res.data.category;
  }

  async function updateCategory(id: string, payload: { name?: string; description?: string }) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { category: Category } }>(`/categories/${id}`, {
      method: 'PUT',
      body: payload,
    });
    const idx = categories.value.findIndex((c) => c._id === id);
    if (idx !== -1) categories.value[idx] = res.data.category;
    return res.data.category;
  }

  async function deleteCategory(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/categories/${id}`, { method: 'DELETE' });
    categories.value = categories.value.filter((c) => c._id !== id);
  }

  return { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory };
});
