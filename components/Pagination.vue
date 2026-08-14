<script setup lang="ts">
import type { Pagination } from '~/types';

const props = defineProps<{ pagination: Pagination }>();
const emit = defineEmits<{ (e: 'change', page: number): void }>();

const goTo = (page: number) => {
  if (page < 1 || page > props.pagination.pages || page === props.pagination.page) return;
  emit('change', page);
};
</script>

<template>
  <nav v-if="pagination.pages > 1" class="pagination" aria-label="Paginación">
    <button type="button" class="btn btn-outline" :disabled="pagination.page <= 1" @click="goTo(pagination.page - 1)">
      ← Anterior
    </button>
    <span class="pagination__info">Página {{ pagination.page }} de {{ pagination.pages }} ({{ pagination.total }} resultados)</span>
    <button
      type="button"
      class="btn btn-outline"
      :disabled="pagination.page >= pagination.pages"
      @click="goTo(pagination.page + 1)"
    >
      Siguiente →
    </button>
  </nav>
</template>
