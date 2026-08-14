<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: 'admin' });

const dashboardStore = useDashboardStore();
const loading = ref(true);
const loadError = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    await dashboardStore.fetchDashboard();
  } catch (err: any) {
    loadError.value = err?.data?.message || 'No se pudieron cargar las estadísticas';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h1>Estadísticas generales</h1>
    <p class="text-muted">Datos calculados en tiempo real contra la base de datos.</p>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="loadError" :message="loadError" />
    <div v-else-if="dashboardStore.data" class="stat-grid">
      <StatCard label="Usuarios registrados" :value="dashboardStore.data.totalUsers" icon="👤" />
      <StatCard label="Organizadores" :value="dashboardStore.data.totalOrganizers" icon="🧑‍💼" />
      <StatCard label="Actividades totales" :value="dashboardStore.data.totalEvents" icon="🗓️" />
      <StatCard label="Inscripciones confirmadas" :value="dashboardStore.data.totalRegistrations" icon="✅" />
      <StatCard label="Actividades activas" :value="dashboardStore.data.activeEvents" icon="🟢" />
      <StatCard label="Actividades finalizadas" :value="dashboardStore.data.finishedEvents" icon="🏁" />
    </div>
  </div>
</template>
