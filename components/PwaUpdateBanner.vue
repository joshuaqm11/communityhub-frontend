<script setup lang="ts">
/**
 * $pwa lo inyecta el módulo @vite-pwa/nuxt (plugin autogenerado):
 * - offlineReady: el service worker terminó de cachear todo lo necesario
 *   para funcionar sin conexión.
 * - needRefresh: hay una versión nueva del service worker esperando
 *   (registerType: 'prompt' en nuxt.config.ts).
 * - updateServiceWorker(): activa la nueva versión y recarga.
 */
const nuxtApp = useNuxtApp();
const pwa = (nuxtApp as unknown as { $pwa?: { offlineReady?: boolean; needRefresh?: boolean; updateServiceWorker?: () => void } }).$pwa;

const dismissedReady = ref(false);
</script>

<template>
  <div v-if="pwa?.offlineReady && !dismissedReady" class="status-banner status-banner--ready" role="status">
    <span>✅ CommunityHub ya está listo para funcionar sin conexión.</span>
    <button type="button" class="status-banner__close" aria-label="Cerrar aviso" @click="dismissedReady = true">✕</button>
  </div>

  <div v-if="pwa?.needRefresh" class="status-banner status-banner--update" role="status">
    <span>🔄 Hay una nueva versión de CommunityHub disponible.</span>
    <button type="button" class="btn btn-sm btn-primary" @click="pwa?.updateServiceWorker?.()">Actualizar</button>
  </div>
</template>
