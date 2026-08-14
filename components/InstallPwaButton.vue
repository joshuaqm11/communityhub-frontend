<script setup lang="ts">
const { canInstall, installed, promptInstall } = useInstallPrompt();
</script>

<template>
  <button
    v-if="canInstall && !installed"
    type="button"
    class="btn btn-outline btn-sm navbar__install"
    @click="promptInstall"
  >
    ⬇️ Instalar app
  </button>
</template>
