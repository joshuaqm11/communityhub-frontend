<script setup lang="ts">
const eventsStore = useEventsStore();
const loading = ref(true);

onMounted(async () => {
  try {
    await eventsStore.fetchEvents({ status: 'active', limit: 6 });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <section class="hero">
      <div class="container">
        <h1>Bienvenido a CommunityHub</h1>
        <p>Descubre, organiza y participa en actividades de tu comunidad.</p>
        <NuxtLink to="/events" class="btn btn-primary">Ver actividades</NuxtLink>
      </div>
    </section>

    <section class="container">
      <h2>Próximas actividades</h2>
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="eventsStore.events.length === 0" message="Todavía no hay actividades publicadas." />
      <div v-else class="events-grid">
        <EventCard v-for="event in eventsStore.events" :key="event._id" :event="event" :show-actions="false" />
      </div>
    </section>
  </div>
</template>
