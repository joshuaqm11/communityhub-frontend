<script setup lang="ts">
const eventsStore = useEventsStore();
const categoriesStore = useCategoriesStore();
const authStore = useAuthStore();

const filters = reactive({
  search: '',
  category: '',
  date: '',
  location: '',
  available: false,
  page: 1,
});

const loading = ref(true);
const busyId = ref<string | null>(null);
const actionError = ref<string | null>(null);

const favoriteIds = ref<Set<string>>(new Set());
const registeredIds = ref<Set<string>>(new Set());

const load = async () => {
  loading.value = true;
  try {
    await eventsStore.fetchEvents({
      search: filters.search || undefined,
      category: filters.category || undefined,
      date: filters.date || undefined,
      location: filters.location || undefined,
      available: filters.available || undefined,
      page: filters.page,
      status: 'active',
    });
  } finally {
    loading.value = false;
  }
};

const loadMyState = async () => {
  if (!authStore.isAuthenticated) return;
  await Promise.all([eventsStore.fetchMyFavorites(), eventsStore.fetchMyRegistrations()]);
  favoriteIds.value = new Set(eventsStore.myFavorites.map((e) => e._id));
  registeredIds.value = new Set(eventsStore.myRegistrations.map((e) => e._id));
};

onMounted(async () => {
  await categoriesStore.fetchCategories();
  await Promise.all([load(), loadMyState()]);
});

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
watch(
  () => [filters.search, filters.category, filters.date, filters.location, filters.available],
  () => {
    if (debounceHandle) clearTimeout(debounceHandle);
    debounceHandle = setTimeout(() => {
      filters.page = 1;
      load();
    }, 300);
  }
);

const changePage = (page: number) => {
  filters.page = page;
  load();
};

const toggleFavorite = async (eventId: string) => {
  if (!authStore.isAuthenticated) return navigateTo('/login');
  busyId.value = eventId;
  actionError.value = null;
  try {
    if (favoriteIds.value.has(eventId)) {
      await eventsStore.removeFavorite(eventId);
      favoriteIds.value.delete(eventId);
    } else {
      await eventsStore.addFavorite(eventId);
      favoriteIds.value.add(eventId);
    }
    favoriteIds.value = new Set(favoriteIds.value);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar favoritos';
  } finally {
    busyId.value = null;
  }
};

const toggleRegister = async (eventId: string) => {
  if (!authStore.isAuthenticated) return navigateTo('/login');
  busyId.value = eventId;
  actionError.value = null;
  try {
    if (registeredIds.value.has(eventId)) {
      await eventsStore.cancelEventRegistration(eventId);
      registeredIds.value.delete(eventId);
    } else {
      await eventsStore.registerToEvent(eventId);
      registeredIds.value.add(eventId);
    }
    registeredIds.value = new Set(registeredIds.value);
    await load();
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar la inscripción';
  } finally {
    busyId.value = null;
  }
};
</script>

<template>
  <div class="container">
    <h1>Actividades</h1>

    <form class="filters" novalidate @submit.prevent>
      <input v-model="filters.search" type="search" placeholder="Buscar por título o descripción" />
      <select v-model="filters.category">
        <option value="">Todas las categorías</option>
        <option v-for="cat in categoriesStore.categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
      </select>
      <input v-model="filters.date" type="date" />
      <input v-model="filters.location" type="text" placeholder="Ubicación" />
      <label class="filters__checkbox">
        <input v-model="filters.available" type="checkbox" /> Solo con cupo disponible
      </label>
    </form>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="eventsStore.events.length === 0" message="No se encontraron actividades con esos filtros." />
    <template v-else>
      <div class="events-grid">
        <EventCard
          v-for="event in eventsStore.events"
          :key="event._id"
          :event="event"
          :show-actions="authStore.isAuthenticated"
          :favorited="favoriteIds.has(event._id)"
          :registered="registeredIds.has(event._id)"
          :busy="busyId === event._id"
          @toggle-favorite="toggleFavorite"
          @toggle-register="toggleRegister"
        />
      </div>
      <Pagination :pagination="eventsStore.pagination" @change="changePage" />
    </template>
  </div>
</template>
