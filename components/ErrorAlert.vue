<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="alert alert--error" role="alert">
    ⚠️ {{ message }}
  </div>
</template>
