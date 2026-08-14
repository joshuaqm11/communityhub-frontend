<script setup lang="ts">
import type { Registration, User } from '~/types';

definePageMeta({ middleware: ['organizer'] });

const route = useRoute();
const eventsStore = useEventsStore();

const eventId = route.params.id as string;
const loading = ref(true);
const loadError = ref<string | null>(null);
const participants = ref<Registration[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    await eventsStore.fetchEvent(eventId);
    participants.value = await eventsStore.fetchEventParticipants(eventId);
  } catch (err: any) {
    loadError.value = err?.data?.message || 'No se pudieron cargar los participantes (¿es usted el organizador de esta actividad?)';
  } finally {
    loading.value = false;
  }
});

const asUser = (registration: Registration) => registration.user as User;
</script>

<template>
  <div class="container">
    <h1>
      Participantes
      <span v-if="eventsStore.currentEvent" class="text-muted">— {{ eventsStore.currentEvent.title }}</span>
    </h1>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="loadError" :message="loadError" />
    <EmptyState v-else-if="participants.length === 0" message="Todavía no hay inscritos en esta actividad." />
    <table v-else class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Correo</th>
          <th>Inscrito el</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="registration in participants" :key="registration._id">
          <td>{{ asUser(registration).firstName }} {{ asUser(registration).lastName }}</td>
          <td>{{ asUser(registration).email }}</td>
          <td>{{ new Date(registration.createdAt).toLocaleDateString('es-CR') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
