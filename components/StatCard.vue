<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: number | string;
    icon?: string;
  }>(),
  { icon: '📊' }
);
</script>

<template>
  <div class="stat-card">
    <span class="stat-card__icon" aria-hidden="true">{{ icon }}</span>
    <div>
      <p class="stat-card__value">{{ value }}</p>
      <p class="stat-card__label">{{ label }}</p>
    </div>
  </div>
</template>
