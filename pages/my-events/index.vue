<script setup lang="ts">
definePageMeta({ middleware: ['organizer'] });

const eventsStore = useEventsStore();
const authStore = useAuthStore();

const loading = ref(true);
const actionError = ref<string | null>(null);
const deleteTarget = ref<string | null>(null);
const deleting = ref(false);

const load = async () => {
  loading.value = true;
  try {
    await eventsStore.fetchEvents({ organizer: authStore.user?._id, limit: 50 });
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const statusLabel = (status: string) =>
  ({ active: 'Activa', cancelled: 'Cancelada', finished: 'Finalizada' })[status] || status;

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  deleting.value = true;
  actionError.value = null;
  try {
    await eventsStore.deleteEvent(deleteTarget.value);
    eventsStore.events = eventsStore.events.filter((e) => e._id !== deleteTarget.value);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo eliminar la actividad';
  } finally {
    deleting.value = false;
    deleteTarget.value = null;
  }
};
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1>Mis actividades</h1>
      <NuxtLink to="/my-events/create" class="btn btn-primary">+ Crear actividad</NuxtLink>
    </div>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="eventsStore.events.length === 0" message="Todavía no has creado ninguna actividad.">
      <NuxtLink to="/my-events/create" class="btn btn-primary">Crear mi primera actividad</NuxtLink>
    </EmptyState>

    <table v-else class="table">
      <thead>
        <tr>
          <th>Título</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Inscritos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in eventsStore.events" :key="event._id">
          <td><NuxtLink :to="`/events/${event._id}`">{{ event.title }}</NuxtLink></td>
          <td>{{ new Date(event.date).toLocaleDateString('es-CR') }}</td>
          <td><span class="badge" :class="{ 'badge--muted': event.status !== 'active' }">{{ statusLabel(event.status) }}</span></td>
          <td>{{ event.registeredCount }}/{{ event.capacity }}</td>
          <td class="table__actions">
            <NuxtLink :to="`/my-events/${event._id}/participants`" class="btn btn-outline btn-sm">Participantes</NuxtLink>
            <NuxtLink :to="`/my-events/${event._id}/edit`" class="btn btn-outline btn-sm">Editar</NuxtLink>
            <button type="button" class="btn btn-danger btn-sm" @click="deleteTarget = event._id">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      v-if="deleteTarget"
      title="Eliminar actividad"
      message="Se eliminará la actividad junto con sus inscripciones y favoritos asociados. ¿Continuar?"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
