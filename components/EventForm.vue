<script setup lang="ts">
import type { Category, EventItem } from '~/types';

const props = withDefaults(
  defineProps<{
    initial?: Partial<EventItem> | null;
    categories: Category[];
    submitLabel?: string;
    busy?: boolean;
  }>(),
  {
    initial: null,
    submitLabel: 'Guardar',
    busy: false,
  }
);

const emit = defineEmits<{ (e: 'submit', payload: Record<string, unknown>): void; (e: 'cancel'): void }>();

const toDateInputValue = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const initialCategory = props.initial?.category;
const form = reactive({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  category: typeof initialCategory === 'string' ? initialCategory : initialCategory?._id ?? '',
  date: toDateInputValue(props.initial?.date),
  time: props.initial?.time ?? '',
  location: props.initial?.location ?? '',
  capacity: props.initial?.capacity ?? 10,
  image: props.initial?.image ?? '',
});

const errors = reactive<Record<string, string>>({});

const today = new Date().toISOString().slice(0, 10);

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!form.title.trim()) errors.title = 'El título es obligatorio';
  if (!form.date) errors.date = 'La fecha es obligatoria';
  else if (form.date < today) errors.date = 'No se permiten fechas pasadas';
  if (!form.time) errors.time = 'La hora es obligatoria';
  if (!form.location.trim()) errors.location = 'La ubicación es obligatoria';
  if (form.capacity === null || form.capacity === undefined || Number(form.capacity) < 0) {
    errors.capacity = 'La capacidad no puede ser negativa';
  }

  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category || null,
    date: form.date,
    time: form.time,
    location: form.location.trim(),
    capacity: Number(form.capacity),
    image: form.image.trim() || null,
  });
};
</script>

<template>
  <form class="event-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="title">Título *</label>
      <input id="title" v-model="form.title" type="text" maxlength="120" />
      <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
    </div>

    <div class="form-group">
      <label for="description">Descripción</label>
      <textarea id="description" v-model="form.description" rows="4" />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="category">Categoría</label>
        <select id="category" v-model="form.category">
          <option value="">Sin categoría</option>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label for="capacity">Capacidad *</label>
        <input id="capacity" v-model.number="form.capacity" type="number" min="0" />
        <p v-if="errors.capacity" class="form-error">{{ errors.capacity }}</p>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="date">Fecha *</label>
        <input id="date" v-model="form.date" type="date" :min="today" />
        <p v-if="errors.date" class="form-error">{{ errors.date }}</p>
      </div>

      <div class="form-group">
        <label for="time">Hora *</label>
        <input id="time" v-model="form.time" type="time" />
        <p v-if="errors.time" class="form-error">{{ errors.time }}</p>
      </div>
    </div>

    <div class="form-group">
      <label for="location">Ubicación *</label>
      <input id="location" v-model="form.location" type="text" />
      <p v-if="errors.location" class="form-error">{{ errors.location }}</p>
    </div>

    <div class="form-group">
      <label for="image">URL de imagen (opcional)</label>
      <input id="image" v-model="form.image" type="url" placeholder="https://…" />
    </div>

    <div class="event-form__actions">
      <button type="button" class="btn btn-outline" :disabled="busy" @click="emit('cancel')">Cancelar</button>
      <button type="submit" class="btn btn-primary" :disabled="busy">
        {{ busy ? 'Guardando…' : submitLabel }}
      </button>
    </div>
  </form>
</template>
