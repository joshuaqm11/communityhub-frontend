<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const eventsStore = useEventsStore();

const loading = ref(true);
const busyId = ref<string | null>(null);
const actionError = ref<string | null>(null);
const registeredIds = ref<Set<string>>(new Set());

const load = async () => {
  loading.value = true;
  try {
    await Promise.all([eventsStore.fetchMyFavorites(), eventsStore.fetchMyRegistrations()]);
    registeredIds.value = new Set(eventsStore.myRegistrations.map((e) => e._id));
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const removeFavorite = async (eventId: string) => {
  busyId.value = eventId;
  actionError.value = null;
  try {
    await eventsStore.removeFavorite(eventId);
    eventsStore.myFavorites = eventsStore.myFavorites.filter((e) => e._id !== eventId);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo quitar de favoritos';
  } finally {
    busyId.value = null;
  }
};

const toggleRegister = async (eventId: string) => {
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
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar la inscripción';
  } finally {
    busyId.value = null;
  }
};
</script>

<template>
  <div class="container">
    <h1>Mis favoritos</h1>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="eventsStore.myFavorites.length === 0" message="Aún no tienes actividades favoritas.">
      <NuxtLink to="/events" class="btn btn-primary">Explorar actividades</NuxtLink>
    </EmptyState>
    <div v-else class="events-grid">
      <EventCard
        v-for="event in eventsStore.myFavorites"
        :key="event._id"
        :event="event"
        favorited
        :registered="registeredIds.has(event._id)"
        :busy="busyId === event._id"
        @toggle-favorite="removeFavorite"
        @toggle-register="toggleRegister"
      />
    </div>
  </div>
</template>
