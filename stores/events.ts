import { defineStore } from 'pinia';
import type { EventItem, Pagination, Registration, Favorite } from '~/types';

export interface EventFilters {
  search?: string;
  category?: string;
  date?: string;
  location?: string;
  available?: boolean;
  organizer?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useEventsStore = defineStore('events', () => {
  const events = ref<EventItem[]>([]);
  const currentEvent = ref<EventItem | null>(null);
  const pagination = ref<Pagination>({ total: 0, page: 1, limit: 10, pages: 1 });
  const myRegistrations = ref<EventItem[]>([]);
  const myFavorites = ref<EventItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEvents(filters: EventFilters = {}) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const query: Record<string, string> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') query[key] = String(value);
      });
      const res = await apiFetch<{ success: boolean; data: { events: EventItem[]; pagination: Pagination } }>(
        '/events',
        { query }
      );
      events.value = res.data.events;
      pagination.value = res.data.pagination;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se pudieron cargar las actividades';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchEvent(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const { apiFetch } = useApi();
      const res = await apiFetch<{ success: boolean; data: { event: EventItem } }>(`/events/${id}`);
      currentEvent.value = res.data.event;
      return res.data.event;
    } catch (err: any) {
      error.value = err?.data?.message || 'No se encontró la actividad';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(payload: Record<string, unknown>) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { event: EventItem } }>('/events', {
      method: 'POST',
      body: payload,
    });
    return res.data.event;
  }

  async function updateEvent(id: string, payload: Record<string, unknown>) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { event: EventItem } }>(`/events/${id}`, {
      method: 'PUT',
      body: payload,
    });
    return res.data.event;
  }

  async function deleteEvent(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/events/${id}`, { method: 'DELETE' });
  }

  async function registerToEvent(id: string) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { registration: Registration } }>(
      `/events/${id}/register`,
      { method: 'POST' }
    );
    return res.data.registration;
  }

  async function cancelEventRegistration(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/events/${id}/register`, { method: 'DELETE' });
  }

  async function addFavorite(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/events/${id}/favorite`, { method: 'POST' });
  }

  async function removeFavorite(id: string) {
    const { apiFetch } = useApi();
    await apiFetch(`/events/${id}/favorite`, { method: 'DELETE' });
  }

  async function fetchMyRegistrations() {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { registrations: Registration[] } }>(
      '/users/me/registrations'
    );
    myRegistrations.value = res.data.registrations.map((r) => r.event).filter(Boolean);
  }

  async function fetchMyFavorites() {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { favorites: Favorite[] } }>('/users/me/favorites');
    myFavorites.value = res.data.favorites.map((f) => f.event).filter(Boolean);
  }

  async function fetchEventParticipants(id: string) {
    const { apiFetch } = useApi();
    const res = await apiFetch<{ success: boolean; data: { participants: Registration[] } }>(
      `/events/${id}/participants`
    );
    return res.data.participants;
  }

  return {
    events,
    currentEvent,
    pagination,
    myRegistrations,
    myFavorites,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    registerToEvent,
    cancelEventRegistration,
    addFavorite,
    removeFavorite,
    fetchMyRegistrations,
    fetchMyFavorites,
    fetchEventParticipants,
  };
});
