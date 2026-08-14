<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const authStore = useAuthStore();
const usersStore = useUsersStore();

const form = reactive({
  firstName: authStore.user?.firstName ?? '',
  lastName: authStore.user?.lastName ?? '',
  profilePicture: authStore.user?.profilePicture ?? '',
});

const errors = reactive<Record<string, string>>({});
const submitError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const submitting = ref(false);

const roleLabel: Record<string, string> = { admin: 'Administrador', organizer: 'Organizador', user: 'Usuario' };

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
  if (!form.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  submitError.value = null;
  successMessage.value = null;
  if (!validate() || !authStore.user) return;

  submitting.value = true;
  try {
    const updated = await usersStore.updateUser(authStore.user._id, {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      profilePicture: form.profilePicture.trim() || null,
    });
    authStore.user = updated;
    successMessage.value = 'Perfil actualizado correctamente';
  } catch (err: any) {
    submitError.value = err?.data?.message || 'No se pudo actualizar el perfil';
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <h1>Mi perfil</h1>

    <div class="card">
      <p class="text-muted">
        {{ authStore.user?.email }} ·
        <span class="badge">{{ roleLabel[authStore.user?.role ?? 'user'] }}</span>
      </p>

      <ErrorAlert v-if="submitError" :message="submitError" />
      <div v-if="successMessage" class="alert alert--success">{{ successMessage }}</div>

      <form novalidate @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input id="firstName" v-model="form.firstName" type="text" />
            <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
          </div>
          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input id="lastName" v-model="form.lastName" type="text" />
            <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
          </div>
        </div>

        <div class="form-group">
          <label for="profilePicture">Foto de perfil (URL)</label>
          <input id="profilePicture" v-model="form.profilePicture" type="url" placeholder="https://…" />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </form>
    </div>
  </div>
</template>
