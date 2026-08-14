<script setup lang="ts">
definePageMeta({ middleware: ['guest'] });

const authStore = useAuthStore();
const route = useRoute();

const form = reactive({ email: '', password: '' });
const errors = reactive<Record<string, string>>({});
const submitError = ref<string | null>(null);
const submitting = ref(false);

const validate = () => {
  Object.keys(errors).forEach((key) => delete errors[key]);
  if (!form.email.trim()) errors.email = 'El correo es obligatorio';
  else if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Correo electrónico inválido';
  if (!form.password) errors.password = 'La contraseña es obligatoria';
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  submitError.value = null;
  if (!validate()) return;

  submitting.value = true;
  try {
    await authStore.login(form.email.trim(), form.password);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    navigateTo(redirect);
  } catch (err: any) {
    submitError.value = err?.data?.message || 'No se pudo iniciar sesión';
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="container container--narrow">
    <div class="card auth-card">
      <h1>Iniciar sesión</h1>

      <ErrorAlert v-if="submitError" :message="submitError" />

      <form novalidate @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" v-model="form.email" type="email" autocomplete="email" />
          <p v-if="errors.email" class="form-error">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="form.password" type="password" autocomplete="current-password" />
          <p v-if="errors.password" class="form-error">{{ errors.password }}</p>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
          {{ submitting ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>

      <p class="auth-card__footer">
        ¿No tienes cuenta? <NuxtLink to="/register">Regístrate</NuxtLink>
      </p>
    </div>
  </div>
</template>
