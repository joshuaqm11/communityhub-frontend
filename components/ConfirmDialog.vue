<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    busy?: boolean;
    danger?: boolean;
  }>(),
  {
    title: 'Confirmar acción',
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    busy: false,
    danger: false,
  }
);

const emit = defineEmits<{ (e: 'confirm'): void; (e: 'cancel'): void }>();
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal" role="dialog" aria-modal="true">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="modal__actions">
        <button type="button" class="btn btn-outline" :disabled="busy" @click="emit('cancel')">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn"
          :class="danger ? 'btn-danger' : 'btn-primary'"
          :disabled="busy"
          @click="emit('confirm')"
        >
          {{ busy ? 'Procesando…' : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
