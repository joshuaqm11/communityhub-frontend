<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: 'admin' });

const categoriesStore = useCategoriesStore();

const loading = ref(true);
const actionError = ref<string | null>(null);
const deleteTarget = ref<string | null>(null);
const deleting = ref(false);

const newCategory = reactive({ name: '', description: '' });
const creating = ref(false);
const createError = ref<string | null>(null);

const editingId = ref<string | null>(null);
const editForm = reactive({ name: '', description: '' });
const savingEdit = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    await categoriesStore.fetchCategories();
  } finally {
    loading.value = false;
  }
});

const createCategory = async () => {
  createError.value = null;
  if (!newCategory.name.trim()) {
    createError.value = 'El nombre de la categoría es obligatorio';
    return;
  }
  creating.value = true;
  try {
    await categoriesStore.createCategory({ name: newCategory.name.trim(), description: newCategory.description.trim() });
    newCategory.name = '';
    newCategory.description = '';
  } catch (err: any) {
    createError.value = err?.data?.message || 'No se pudo crear la categoría';
  } finally {
    creating.value = false;
  }
};

const startEdit = (category: { _id: string; name: string; description?: string }) => {
  editingId.value = category._id;
  editForm.name = category.name;
  editForm.description = category.description || '';
};

const saveEdit = async () => {
  if (!editingId.value) return;
  savingEdit.value = true;
  actionError.value = null;
  try {
    await categoriesStore.updateCategory(editingId.value, { name: editForm.name.trim(), description: editForm.description.trim() });
    editingId.value = null;
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo actualizar la categoría';
  } finally {
    savingEdit.value = false;
  }
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  deleting.value = true;
  actionError.value = null;
  try {
    await categoriesStore.deleteCategory(deleteTarget.value);
  } catch (err: any) {
    actionError.value = err?.data?.message || 'No se pudo eliminar la categoría';
  } finally {
    deleting.value = false;
    deleteTarget.value = null;
  }
};
</script>

<template>
  <div>
    <h1>Categorías</h1>

    <div class="card">
      <h2>Nueva categoría</h2>
      <ErrorAlert v-if="createError" :message="createError" />
      <form class="form-row" novalidate @submit.prevent="createCategory">
        <div class="form-group">
          <label for="newName">Nombre</label>
          <input id="newName" v-model="newCategory.name" type="text" />
        </div>
        <div class="form-group">
          <label for="newDescription">Descripción</label>
          <input id="newDescription" v-model="newCategory.description" type="text" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="creating">
          {{ creating ? 'Creando…' : '+ Agregar' }}
        </button>
      </form>
    </div>

    <ErrorAlert v-if="actionError" :message="actionError" />

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="categoriesStore.categories.length === 0" message="Todavía no hay categorías." />
    <table v-else class="table">
      <thead>
        <tr><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        <tr v-for="category in categoriesStore.categories" :key="category._id">
          <template v-if="editingId === category._id">
            <td><input v-model="editForm.name" type="text" /></td>
            <td><input v-model="editForm.description" type="text" /></td>
            <td class="table__actions">
              <button type="button" class="btn btn-primary btn-sm" :disabled="savingEdit" @click="saveEdit">Guardar</button>
              <button type="button" class="btn btn-outline btn-sm" @click="editingId = null">Cancelar</button>
            </td>
          </template>
          <template v-else>
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
            <td class="table__actions">
              <button type="button" class="btn btn-outline btn-sm" @click="startEdit(category)">Editar</button>
              <button type="button" class="btn btn-danger btn-sm" @click="deleteTarget = category._id">Eliminar</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <ConfirmDialog
      v-if="deleteTarget"
      title="Eliminar categoría"
      message="Si hay actividades usando esta categoría, el backend bloqueará la eliminación."
      confirm-label="Eliminar"
      danger
      :busy="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
