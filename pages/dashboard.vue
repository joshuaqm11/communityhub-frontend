<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
const notificationsStore = useNotificationsStore();

const loading = ref(true);
const loadError = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  try {
    await dashboardStore.fetchDashboard();
  } catch (err: any) {
    loadError.value = err?.data?.message || 'No se pudo cargar el dashboard';
  } finally {
    loading.value = false;
  }
});

const markRead = async (id: string) => {
  await notificationsStore.markAsRead(id);
  const notification = dashboardStore.data?.notifications?.find((n: any) => n._id === id);
  if (notification) notification.read = true;
};
</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <p class="text-muted">Bienvenido, {{ authStore.user?.firstName }}.</p>

    <LoadingSpinner v-if="loading" />
    <ErrorAlert v-else-if="loadError" :message="loadError" />

    <template v-else-if="dashboardStore.data">
      <!-- Dashboard de usuario -->
      <div v-if="dashboardStore.data.role === 'user'" class="dashboard-sections">
        <section class="card">
          <h2>Próximas actividades</h2>
          <EmptyState v-if="dashboardStore.data.upcomingEvents.length === 0" message="No tienes actividades próximas." />
          <ul v-else class="simple-list">
            <li v-for="event in dashboardStore.data.upcomingEvents" :key="event._id">
              <NuxtLink :to="`/events/${event._id}`">{{ event.title }}</NuxtLink> — {{ new Date(event.date).toLocaleDateString('es-CR') }}
            </li>
          </ul>
        </section>

        <div class="stat-grid">
          <StatCard label="Inscripciones activas" :value="dashboardStore.data.myRegistrations.length" icon="✅" />
          <StatCard label="Favoritos" :value="dashboardStore.data.favorites.length" icon="⭐" />
          <StatCard label="Historial" :value="dashboardStore.data.history.length" icon="🕘" />
          <StatCard label="Notificaciones sin leer" :value="dashboardStore.data.unreadNotifications" icon="🔔" />
        </div>

        <section class="card">
          <h2>Notificaciones recientes</h2>
          <EmptyState v-if="dashboardStore.data.notifications.length === 0" message="No tienes notificaciones." />
          <ul v-else class="notification-list">
            <li v-for="n in dashboardStore.data.notifications" :key="n._id" :class="{ 'notification--unread': !n.read }">
              <span>{{ n.message }}</span>
              <button v-if="!n.read" type="button" class="btn btn-outline btn-sm" @click="markRead(n._id)">Marcar leída</button>
            </li>
          </ul>
        </section>
      </div>

      <!-- Dashboard de organizador -->
      <div v-else-if="dashboardStore.data.role === 'organizer'" class="dashboard-sections">
        <div class="stat-grid">
          <StatCard label="Actividades creadas" :value="dashboardStore.data.myEvents.length" icon="🗓️" />
          <StatCard label="Próximas" :value="dashboardStore.data.upcomingEvents.length" icon="⏭️" />
          <StatCard label="Canceladas" :value="dashboardStore.data.cancelledEvents.length" icon="🚫" />
          <StatCard label="Total de participantes" :value="dashboardStore.data.totalParticipants" icon="👥" />
        </div>

        <section class="card">
          <h2>Disponibilidad por actividad</h2>
          <EmptyState v-if="dashboardStore.data.availability.length === 0" message="Todavía no has creado actividades." />
          <table v-else class="table">
            <thead>
              <tr><th>Actividad</th><th>Inscritos</th><th>Disponibles</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in dashboardStore.data.availability" :key="item.eventId">
                <td>{{ item.title }}</td>
                <td>{{ item.registered }}/{{ item.capacity }}</td>
                <td>{{ item.available }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <NuxtLink to="/my-events" class="btn btn-primary">Gestionar mis actividades</NuxtLink>
      </div>

      <!-- Dashboard de administrador -->
      <div v-else-if="dashboardStore.data.role === 'admin'" class="dashboard-sections">
        <div class="stat-grid">
          <StatCard label="Usuarios registrados" :value="dashboardStore.data.totalUsers" icon="👤" />
          <StatCard label="Organizadores" :value="dashboardStore.data.totalOrganizers" icon="🧑‍💼" />
          <StatCard label="Actividades" :value="dashboardStore.data.totalEvents" icon="🗓️" />
          <StatCard label="Inscripciones" :value="dashboardStore.data.totalRegistrations" icon="✅" />
          <StatCard label="Activas" :value="dashboardStore.data.activeEvents" icon="🟢" />
          <StatCard label="Finalizadas" :value="dashboardStore.data.finishedEvents" icon="🏁" />
        </div>
        <NuxtLink to="/admin" class="btn btn-primary">Ir al panel de administración</NuxtLink>
      </div>
    </template>
  </div>
</template>
