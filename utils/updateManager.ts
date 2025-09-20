interface UpdateResult {
  status: 'success' | 'fail' | 'unchanged';
  buildInfo?: any;
}

export const checkAndInstallUpdate = async (): Promise<UpdateResult> => {
  try {
    // Prüfe ob Service Worker verfügbar ist
    if (!('serviceWorker' in navigator)) {
      return { status: 'fail' };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return { status: 'fail' };
    }

    // Prüfe auf Updates
    await registration.update();

    // Warte kurz und prüfe ob ein neuer Service Worker installiert wurde
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedRegistration = await navigator.serviceWorker.getRegistration();
    
    if (updatedRegistration?.waiting) {
      // Neuer Service Worker verfügbar - aktiviere ihn
      updatedRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Warte auf Aktivierung
      await new Promise((resolve) => {
        const handleStateChange = () => {
          if (updatedRegistration.waiting?.state === 'activated') {
            updatedRegistration.waiting.removeEventListener('statechange', handleStateChange);
            resolve(void 0);
          }
        };
        updatedRegistration.waiting?.addEventListener('statechange', handleStateChange);
      });

      // Lade die Seite neu um die neue Version zu verwenden
      window.location.reload();
      
      return { 
        status: 'success',
        buildInfo: { message: 'Update installiert, Seite wird neu geladen...' }
      };
    }

    // Kein Update verfügbar
    return { status: 'unchanged' };

  } catch (error) {
    console.error('Update check failed:', error);
    return { status: 'fail' };
  }
};