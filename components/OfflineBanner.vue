<script setup lang="ts">
const { isOnline } = useOnlineStatus();
</script>

<template>
  <div v-if="!isOnline" class="status-banner status-banner--offline" role="status" aria-live="polite">
    🔌 Sin conexión — estás viendo actividades guardadas previamente.
  </div>
</template>
