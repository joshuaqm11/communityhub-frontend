/**
 * Estado reactivo de conexión (navigator.onLine + eventos online/offline
 * del navegador). Se usa para mostrar de forma clara al usuario cuando
 * está sin conexión (sección "21. Funcionalidad offline" del enunciado).
 */
export const useOnlineStatus = () => {
  const isOnline = ref(true);

  const update = () => {
    isOnline.value = navigator.onLine;
  };

  onMounted(() => {
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
  });

  onUnmounted(() => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  });

  return { isOnline };
};
