<script setup lang="ts">
import type { User } from '~/types';

definePageMeta({ middleware: ['admin'], layout: 'admin' });

const eventsStore = useEventsStore();

const search = ref('');
const loading = ref(true);
const actionError = ref<string | null>(null);
const deleteTarget = ref<string | null>(null);
const deleting = ref(false);

const load = async (page = 1) => {
  loading.value = true;
  try {
    await eventsStore.fetchEvents({ search: search.value || undefined, page, limit: 15 });
  } finally {
    loading.value = false;
  }
};

onMounted(() => load());

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
watch(search, () => {
  if (debounceHandle) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => load(1), 300);
});

const organizerName = (event: (typeof eventsStore.events)[number]) => {
  const organizer = event.organizer as User;
  return typeof event.organizer === 'string' ? event.organizer : `${organizer.firstName} ${organizer.lastName}`;
};

const statusLabel: Record<string, string> = { active: 'Activa', cancelled: 'Cancelada', finished: 'Finalizada' };

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  deleting.value = true;
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
  <div>
    <h1>Todas las actividades</h1>

    <form class="filters" novalidate @submit.prevent>
      <input v-model="search" type="search" placeholder="Buscar por título o descripción" />
    </form>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="eventsStore.events.length === 0" message="No se encontraron actividades." />
    <template v-else>
      <table class="table">
        <thead>
          <tr><th>Título</th><th>Organizador</th><th>Fecha</th><th>Estado</th><th>Inscritos</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="event in eventsStore.events" :key="event._id">
            <td><NuxtLink :to="`/events/${event._id}`">{{ event.title }}</NuxtLink></td>
            <td>{{ organizerName(event) }}</td>
            <td>{{ new Date(event.date).toLocaleDateString('es-CR') }}</td>
            <td>{{ statusLabel[event.status] }}</td>
            <td>{{ event.registeredCount }}/{{ event.capacity }}</td>
            <td class="table__actions">
              <NuxtLink :to="`/my-events/${event._id}/edit`" class="btn btn-outline btn-sm">Editar</NuxtLink>
              <button type="button" class="btn btn-danger btn-sm" @click="deleteTarget = event._id">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :pagination="eventsStore.pagination" @change="load" />
    </template>

    <ConfirmDialog
      v-if="deleteTarget"
      title="Eliminar actividad"
      message="Se eliminará junto con sus inscripciones y favoritos asociados. ¿Continuar?"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
