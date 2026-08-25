<script setup lang="ts">
const authStore = useAuthStore();
const menuOpen = ref(false);

const closeMenu = () => {
  menuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  closeMenu();
  navigateTo('/login');
};

const isOrganizer = computed(() => ['organizer', 'admin'].includes(authStore.user?.role ?? ''));
const isAdmin = computed(() => authStore.user?.role === 'admin');
</script>

<template>
  <header class="navbar">
    <div class="navbar__inner">
      <NuxtLink to="/" class="navbar__brand" @click="closeMenu">CommunityHub</NuxtLink>

      <button
        class="navbar__toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Abrir menú"
        @click="menuOpen = !menuOpen"
      >
        ☰
      </button>

      <nav class="navbar__links" :class="{ 'navbar__links--open': menuOpen }">
        <NuxtLink to="/events" @click="closeMenu">Actividades</NuxtLink>
        <InstallPwaButton />

        <template v-if="authStore.isAuthenticated">
          <NuxtLink to="/favorites" @click="closeMenu">Favoritos</NuxtLink>
          <NuxtLink to="/my-registrations" @click="closeMenu">Mis inscripciones</NuxtLink>
          <NuxtLink v-if="isOrganizer" to="/my-events" @click="closeMenu">Mis actividades</NuxtLink>
          <NuxtLink to="/dashboard" @click="closeMenu">Dashboard</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" @click="closeMenu">Admin</NuxtLink>
          <NuxtLink to="/profile" @click="closeMenu">Mi perfil</NuxtLink>
          <button type="button" class="btn btn-outline navbar__logout" @click="handleLogout">Salir</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" @click="closeMenu">Iniciar sesión</NuxtLink>
          <NuxtLink to="/register" class="btn btn-primary" @click="closeMenu">Registrarme</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>
