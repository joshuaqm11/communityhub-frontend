<script setup lang="ts">
definePageMeta({ middleware: ['guest'] });

const authStore = useAuthStore();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  profilePicture: '',
});
const errors = reactive<Record<string, string>>({});
const submitError = ref<string | null>(null);
const submitting = ref(false);

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
  if (!form.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
  if (!form.email.trim()) errors.email = 'El correo es obligatorio';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Correo electrónico inválido';
  if (!form.password) errors.password = 'La contraseña es obligatoria';
  else if (form.password.length < 8) errors.password = 'Debe tener al menos 8 caracteres';

  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  submitError.value = null;
  if (!validate()) return;

  submitting.value = true;
  try {
    await authStore.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      profilePicture: form.profilePicture.trim() || null,
    });
    navigateTo('/dashboard');
  } catch (err: any) {
    submitError.value = err?.data?.message || 'No se pudo completar el registro';
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <div class="card auth-card">
      <h1>Crear cuenta</h1>

      <ErrorAlert v-if="submitError" :message="submitError" />

      <form novalidate @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Nombre</label>
            <input id="firstName" v-model="form.firstName" type="text" autocomplete="given-name" />
            <p v-if="errors.firstName" class="form-error">{{ errors.firstName }}</p>
          </div>
          <div class="form-group">
            <label for="lastName">Apellido</label>
            <input id="lastName" v-model="form.lastName" type="text" autocomplete="family-name" />
            <p v-if="errors.lastName" class="form-error">{{ errors.lastName }}</p>
          </div>
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" autocomplete="new-password" />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
          <p v-else class="form-hint">Mínimo 8 caracteres.</p>
        </div>

        <div class="form-group">
          <label for="profilePicture">Foto de perfil (URL, opcional)</label>
          <input id="profilePicture" v-model="form.profilePicture" type="url" placeholder="https://…" />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
          {{ submitting ? 'Creando cuenta…' : 'Registrarme' }}
        </button>
      </form>

      <p class="auth-card__footer">
        ¿Ya tienes cuenta? <NuxtLink to="/login">Inicia sesión</NuxtLink>
      </p>
    </div>
  </div>
</template>
