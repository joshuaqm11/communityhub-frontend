<script setup lang="ts">
const route = useRoute();
const eventsStore = useEventsStore();
const authStore = useAuthStore();

const eventId = route.params.id as string;

const loading = ref(true);
const loadError = ref<string | null>(null);
const actionError = ref<string | null>(null);
const busy = ref(false);
const isFavorite = ref(false);
const isRegistered = ref(false);
const showDeleteConfirm = ref(false);
const deleting = ref(false);

const isOwner = computed(() => {
  const event = eventsStore.currentEvent;
  if (!event || !authStore.user) return false;
  const organizerId = typeof event.organizer === 'string' ? event.organizer : event.organizer._id;
  return authStore.user.role === 'admin' || organizerId === authStore.user._id;
});

const organizerName = computed(() => {
  const organizer = eventsStore.currentEvent?.organizer;
  if (!organizer || typeof organizer === 'string') return null;
  return `${organizer.firstName} ${organizer.lastName}`;
});

const categoryName = computed(() => {
  const cat = eventsStore.currentEvent?.category;
  if (!cat || typeof cat === 'string') return null;
  return cat.name;
});

const availableSpots = computed(() => {
  const event = eventsStore.currentEvent;
  if (!event) return 0;
  return Math.max(event.capacity - event.registeredCount, 0);
});

const load = async () => {
  loading.value = true;
  loadError.value = null;
  try {
    await eventsStore.fetchEvent(eventId);
    if (authStore.isAuthenticated) {
      await Promise.all([eventsStore.fetchMyFavorites(), eventsStore.fetchMyRegistrations()]);
      isFavorite.value = eventsStore.myFavorites.some((e) => e._id === eventId);
      isRegistered.value = eventsStore.myRegistrations.some((e) => e._id === eventId);
    }
  } catch (err: any) {
    loadError.value = err?.data?.message || 'No se encontró la actividad';
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) return navigateTo('/login');
  busy.value = true;
  actionError.value = null;
  try {
    if (isFavorite.value) {
      await eventsStore.removeFavorite(eventId);
      isFavorite.value = false;
    } else {
      await eventsStore.addFavorite(eventId);
      isFavorite.value = true;
    }
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar favoritos';
  } finally {
    busy.value = false;
  }
};

const toggleRegister = async () => {
  if (!authStore.isAuthenticated) return navigateTo('/login');
  busy.value = true;
  actionError.value = null;
  try {
    if (isRegistered.value) {
      await eventsStore.cancelEventRegistration(eventId);
      isRegistered.value = false;
    } else {
      await eventsStore.registerToEvent(eventId);
      isRegistered.value = true;
    }
    await eventsStore.fetchEvent(eventId);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar la inscripción';
  } finally {
    busy.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await eventsStore.deleteEvent(eventId);
    navigateTo('/my-events');
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo eliminar la actividad';
    showDeleteConfirm.value = false;
  } finally {
    deleting.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="loadError" :message="loadError" />

    <div v-else-if="eventsStore.currentEvent" class="event-detail">
      <div
        class="event-detail__image"
        :style="eventsStore.currentEvent.image ? { backgroundImage: `url(${eventsStore.currentEvent.image})` } : {}"
      >
        <span v-if="!eventsStore.currentEvent.image" aria-hidden="true">📅</span>
      </div>

      <div class="event-detail__badges">
        <span v-if="categoryName" class="badge">{{ categoryName }}</span>
        <span v-if="eventsStore.currentEvent.status === 'cancelled'" class="badge badge--muted">Cancelada</span>
        <span v-else-if="eventsStore.currentEvent.status === 'finished'" class="badge badge--muted">Finalizada</span>
      </div>

      <h1>{{ eventsStore.currentEvent.title }}</h1>
      <p v-if="organizerName" class="text-muted">Organizado por {{ organizerName }}</p>

      <p class="event-detail__description">{{ eventsStore.currentEvent.description || 'Sin descripción.' }}</p>

      <ul class="event-detail__facts">
        <li>📆 {{ new Date(eventsStore.currentEvent.date).toLocaleDateString('es-CR') }}</li>
        <li>🕒 {{ eventsStore.currentEvent.time }}</li>
        <li>📍 {{ eventsStore.currentEvent.location }}</li>
        <li>👥 {{ eventsStore.currentEvent.registeredCount }}/{{ eventsStore.currentEvent.capacity }} inscritos ({{ availableSpots }} disponibles)</li>
      </ul>

      <ErrorAlert v-if="actionError" :message="actionError" />

      <div v-if="eventsStore.currentEvent.status === 'active'" class="event-detail__actions">
        <button type="button" class="btn btn-icon" :class="{ 'btn-icon--active': isFavorite }" :disabled="busy" @click="toggleFavorite">
          {{ isFavorite ? '★ Favorito' : '☆ Favorito' }}
        </button>
        <button
          type="button"
          class="btn"
          :class="isRegistered ? 'btn-outline' : 'btn-primary'"
          :disabled="busy || (availableSpots <= 0 && !isRegistered)"
          @click="toggleRegister"
        >
          {{ isRegistered ? 'Cancelar inscripción' : availableSpots <= 0 ? 'Sin cupo' : 'Inscribirme' }}
        </button>
      </div>

      <div v-if="isOwner" class="event-detail__owner-actions">
        <h2>Gestión de la actividad</h2>
        <div class="event-detail__actions">
          <NuxtLink :to="`/my-events/${eventId}/edit`" class="btn btn-outline">Editar</NuxtLink>
          <NuxtLink :to="`/my-events/${eventId}/participants`" class="btn btn-outline">Ver participantes</NuxtLink>
          <button type="button" class="btn btn-danger" @click="showDeleteConfirm = true">Eliminar</button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-if="showDeleteConfirm"
      title="Eliminar actividad"
      message="Esta acción eliminará la actividad junto con sus inscripciones y favoritos asociados. ¿Deseas continuar?"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>
