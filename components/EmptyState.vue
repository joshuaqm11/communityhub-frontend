<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string;
    icon?: string;
  }>(),
  { icon: '🗂️' }
);
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon" aria-hidden="true">{{ icon }}</span>
    <p>{{ message }}</p>
    <div v-if="$slots.default" class="empty-state__action">
      <slot />
    </div>
  </div>
</template>
