<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: 'admin' });

const usersStore = useUsersStore();
const authStore = useAuthStore();

const search = ref('');
const roleFilter = ref('');
const loading = ref(true);
const actionError = ref<string | null>(null);
const deleteTarget = ref<string | null>(null);
const deleting = ref(false);
const savingId = ref<string | null>(null);

const roles = [
  { value: 'user', label: 'Usuario' },
  { value: 'organizer', label: 'Organizador' },
  { value: 'admin', label: 'Administrador' },
];

const load = async (page = 1) => {
  loading.value = true;
  try {
    await usersStore.fetchUsers({ page, search: search.value || undefined, role: roleFilter.value || undefined });
  } finally {
    loading.value = false;
  }
};

onMounted(() => load());

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
watch([search, roleFilter], () => {
  if (debounceHandle) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => load(1), 300);
});

const changeRole = async (userId: string, role: string) => {
  savingId.value = userId;
  actionError.value = null;
  try {
    await usersStore.updateUser(userId, { role: role as 'admin' | 'organizer' | 'user' });
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar el rol';
    load(usersStore.pagination.page);
  } finally {
    savingId.value = null;
  }
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await usersStore.deleteUser(deleteTarget.value);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo eliminar el usuario';
  } finally {
    deleting.value = false;
    deleteTarget.value = null;
  }
};
</script>

<template>
  <div>
    <h1>Usuarios</h1>

    <form class="filters" novalidate @submit.prevent>
      <input v-model="search" type="search" placeholder="Buscar por nombre o correo" />
      <select v-model="roleFilter">
        <option value="">Todos los roles</option>
        <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
      </select>
    </form>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="usersStore.users.length === 0" message="No se encontraron usuarios." />
    <template v-else>
      <table class="table">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Registrado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in usersStore.users" :key="user._id">
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <select
                :value="user.role"
                :disabled="savingId === user._id || user._id === authStore.user?._id"
                @change="changeRole(user._id, ($event.target as HTMLSelectElement).value)"
              >
                <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
              </select>
            </td>
            <td>{{ new Date(user.createdAt).toLocaleDateString('es-CR') }}</td>
            <td>
              <button
                type="button"
                class="btn btn-danger btn-sm"
                :disabled="user._id === authStore.user?._id"
                @click="deleteTarget = user._id"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :pagination="usersStore.pagination" @change="load" />
    </template>

    <ConfirmDialog
      v-if="deleteTarget"
      title="Eliminar usuario"
      message="Esta acción no se puede deshacer. ¿Deseas eliminar este usuario?"
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
