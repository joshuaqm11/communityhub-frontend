<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const eventsStore = useEventsStore();

const loading = ref(true);
const busyId = ref<string | null>(null);
const actionError = ref<string | null>(null);
const favoriteIds = ref<Set<string>>(new Set());

const load = async () => {
  loading.value = true;
  try {
    await Promise.all([eventsStore.fetchMyRegistrations(), eventsStore.fetchMyFavorites()]);
    favoriteIds.value = new Set(eventsStore.myFavorites.map((e) => e._id));
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const cancel = async (eventId: string) => {
  busyId.value = eventId;
  actionError.value = null;
  try {
    await eventsStore.cancelEventRegistration(eventId);
    eventsStore.myRegistrations = eventsStore.myRegistrations.filter((e) => e._id !== eventId);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo cancelar la inscripción';
  } finally {
    busyId.value = null;
  }
};

const toggleFavorite = async (eventId: string) => {
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
</script>

<template>
  <div class="container">
    <h1>Mis inscripciones</h1>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="eventsStore.myRegistrations.length === 0" message="No tienes inscripciones activas.">
      <NuxtLink to="/events" class="btn btn-primary">Explorar actividades</NuxtLink>
    </EmptyState>
    <div v-else class="events-grid">
      <EventCard
        v-for="event in eventsStore.myRegistrations"
        :key="event._id"
        :event="event"
        registered
        :favorited="favoriteIds.has(event._id)"
        :busy="busyId === event._id"
        @toggle-register="cancel"
        @toggle-favorite="toggleFavorite"
      />
    </div>
  </div>
</template>
