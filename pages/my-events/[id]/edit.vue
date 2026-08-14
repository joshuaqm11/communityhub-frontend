<script setup lang="ts">
definePageMeta({ middleware: ['organizer'] });

const route = useRoute();
const eventsStore = useEventsStore();
const categoriesStore = useCategoriesStore();
const authStore = useAuthStore();

const eventId = route.params.id as string;

const loading = ref(true);
const loadError = ref<string | null>(null);
const busy = ref(false);
const submitError = ref<string | null>(null);

const canEdit = computed(() => {
  const event = eventsStore.currentEvent;
  if (!event || !authStore.user) return false;
  const organizerId = typeof event.organizer === 'string' ? event.organizer : event.organizer._id;
  return authStore.user.role === 'admin' || organizerId === authStore.user._id;
});

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([eventsStore.fetchEvent(eventId), categoriesStore.fetchCategories()]);
    if (!canEdit.value) {
      loadError.value = 'No tiene permisos para editar esta actividad';
    }
  } catch (err: any) {
    loadError.value = err?.data?.message || 'No se encontró la actividad';
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async (payload: Record<string, unknown>) => {
  busy.value = true;
  submitError.value = null;
  try {
    await eventsStore.updateEvent(eventId, payload);
    navigateTo(`/events/${eventId}`);
  } catch (err: any) {
    submitError.value = err?.data?.message || 'No se pudo actualizar la actividad';
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <h1>Editar actividad</h1>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="loadError" :message="loadError" />
    <div v-else-if="eventsStore.currentEvent" class="card">
      <ErrorAlert v-if="submitError" :message="submitError" />
      <EventForm
        :initial="eventsStore.currentEvent"
        :categories="categoriesStore.categories"
        submit-label="Guardar cambios"
        :busy="busy"
        @submit="handleSubmit"
        @cancel="navigateTo(`/events/${eventId}`)"
      />
    </div>
  </div>
</template>
