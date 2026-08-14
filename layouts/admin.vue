<script setup lang="ts">
const links = [
  { to: '/admin', label: 'Resumen', exact: true },
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/events', label: 'Actividades' },
  { to: '/admin/categories', label: 'Categorías' },
  { to: '/admin/statistics', label: 'Estadísticas' },
];
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <div class="admin-shell">
      <aside class="sidebar">
        <p class="sidebar__title">Administración</p>
        <nav class="sidebar__nav">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="sidebar__link"
            active-class="sidebar__link--active"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
        <NuxtLink to="/dashboard" class="sidebar__back">&larr; Volver al sitio</NuxtLink>
      </aside>
      <main class="app-main admin-shell__content">
        <slot />
      </main>
    </div>
  </div>
</template>
