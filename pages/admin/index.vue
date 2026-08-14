<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: 'admin' });

const links = [
  { to: '/admin/users', label: 'Usuarios', icon: '👤', description: 'Gestionar cuentas y roles' },
  { to: '/admin/events', label: 'Actividades', icon: '🗓️', description: 'Editar o eliminar cualquier actividad' },
  { to: '/admin/categories', label: 'Categorías', icon: '🏷️', description: 'Crear, editar y eliminar categorías' },
  { to: '/admin/statistics', label: 'Estadísticas', icon: '📊', description: 'Métricas generales de la plataforma' },
];
</script>

<template>
  <div>
    <h1>Panel de administración</h1>
    <div class="admin-links">
      <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="card admin-links__item">
        <span class="admin-links__icon" aria-hidden="true">{{ link.icon }}</span>
        <div>
          <p class="admin-links__label">{{ link.label }}</p>
          <p class="text-muted">{{ link.description }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
