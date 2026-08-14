<script setup lang="ts">
definePageMeta({ middleware: ['organizer'] });

const eventsStore = useEventsStore();
const categoriesStore = useCategoriesStore();

const busy = ref(false);
const submitError = ref<string | null>(null);

onMounted(() => {
  categoriesStore.fetchCategories();
});

const handleSubmit = async (payload: Record<string, unknown>) => {
  busy.value = true;
  submitError.value = null;
  try {
    const event = await eventsStore.createEvent(payload);
    navigateTo(`/events/${event._id}`);
  } catch (err: any) {
    submitError.value = err?.data?.message || 'No se pudo crear la actividad';
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <h1>Crear actividad</h1>
    <ErrorAlert v-if="submitError" :message="submitError" />
    <div class="card">
      <EventForm
        :categories="categoriesStore.categories"
        submit-label="Crear actividad"
        :busy="busy"
        @submit="handleSubmit"
        @cancel="navigateTo('/my-events')"
      />
    </div>
  </div>
</template>
