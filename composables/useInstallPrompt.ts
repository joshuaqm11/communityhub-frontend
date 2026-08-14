interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Expone la instalación de la PWA usando el evento estándar del
 * navegador `beforeinstallprompt` (Chrome/Edge/Android). No depende de
 * ninguna API interna de @vite-pwa/nuxt, así que funciona sin importar
 * la versión exacta del módulo.
 */
export const useInstallPrompt = () => {
  const canInstall = ref(false);
  const installed = ref(false);
  let deferredEvent: BeforeInstallPromptEvent | null = null;

  const handleBeforeInstall = (event: Event) => {
    event.preventDefault();
    deferredEvent = event as BeforeInstallPromptEvent;
    canInstall.value = true;
  };

  const handleInstalled = () => {
    installed.value = true;
    canInstall.value = false;
    deferredEvent = null;
  };

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      installed.value = true;
    }
  });

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    window.removeEventListener('appinstalled', handleInstalled);
  });

  const promptInstall = async () => {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    await deferredEvent.userChoice;
    deferredEvent = null;
    canInstall.value = false;
  };

  return { canInstall, installed, promptInstall };
};
