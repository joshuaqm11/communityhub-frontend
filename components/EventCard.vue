<script setup lang="ts">
import type { EventItem } from '~/types';

const props = withDefaults(
  defineProps<{
    event: EventItem;
    showActions?: boolean;
    favorited?: boolean;
    registered?: boolean;
    busy?: boolean;
  }>(),
  {
    showActions: true,
    favorited: false,
    registered: false,
    busy: false,
  }
);

const emit = defineEmits<{
  (e: 'toggle-favorite', eventId: string): void;
  (e: 'toggle-register', eventId: string): void;
}>();

const categoryName = computed(() => {
  const cat = props.event.category;
  if (!cat || typeof cat === 'string') return null;
  return cat.name;
});

const availableSpots = computed(() => Math.max(props.event.capacity - props.event.registeredCount, 0));
const isFull = computed(() => availableSpots.value <= 0);
const formattedDate = computed(() =>
  new Date(props.event.date).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
);
</script>

<template>
  <article class="card event-card">
    <div class="event-card__image" :style="event.image ? { backgroundImage: `url(${event.image})` } : {}">
      <span v-if="!event.image" aria-hidden="true">📅</span>
    </div>

    <div class="event-card__body">
      <div class="event-card__badges">
        <span v-if="categoryName" class="badge">{{ categoryName }}</span>
        <span v-if="event.status === 'cancelled'" class="badge badge--muted">Cancelada</span>
        <span v-else-if="event.status === 'finished'" class="badge badge--muted">Finalizada</span>
      </div>

      <h3 class="event-card__title">
        <NuxtLink :to="`/events/${event._id}`">{{ event.title }}</NuxtLink>
      </h3>

      <p class="event-card__meta">📆 {{ formattedDate }} · 🕒 {{ event.time }}</p>
      <p class="event-card__meta">📍 {{ event.location }}</p>
      <p class="event-card__meta">
        👥 {{ event.registeredCount }}/{{ event.capacity }}
        <span v-if="isFull" class="text-danger"> · Sin cupo</span>
      </p>
    </div>

    <div v-if="showActions" class="event-card__actions">
      <button
        type="button"
        class="btn btn-icon"
        :class="{ 'btn-icon--active': favorited }"
        :disabled="busy"
        @click="emit('toggle-favorite', event._id)"
      >
        {{ favorited ? '★ Favorito' : '☆ Favorito' }}
      </button>
      <button
        v-if="event.status === 'active'"
        type="button"
        class="btn"
        :class="registered ? 'btn-outline' : 'btn-primary'"
        :disabled="busy || (isFull && !registered)"
        @click="emit('toggle-register', event._id)"
      >
        {{ registered ? 'Cancelar inscripción' : isFull ? 'Sin cupo' : 'Inscribirme' }}
      </button>
    </div>
  </article>
</template>
