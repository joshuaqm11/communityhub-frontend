import { defineStore } from 'pinia';
import type { NotificationItem } from '~/types';

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchNotifications(read?: boolean) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const query: Record<string, string> = {};
      if (read !== undefined) query.read = String(read);
      const res = await apiFetch<{
        success: boolean;
        data: { notifications: NotificationItem[]; unreadCount: number };
      }>('/notifications', { query });
      notifications.value = res.data.notifications;
      unreadCount.value = res.data.unreadCount;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudieron cargar las notificaciones';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function markAsRead(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
    const notification = notifications.value.find((n) => n._id === id);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(unreadCount.value - 1, 0);
    }
  }

  return { notifications, unreadCount, loading, error, fetchNotifications, markAsRead };
});
