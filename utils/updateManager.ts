interface UpdateResult {
  status: 'success' | 'fail' | 'unchanged';
  buildInfo?: any;
}

const forceReload = () => {
  // Cache-busting reload - fügt einen Timestamp hinzu um Browser-Cache zu umgehen
  const url = new URL(window.location.href);
  url.searchParams.set('_t', Date.now().toString());
  window.location.href = url.toString();
};

export const checkAndInstallUpdate = async (): Promise<UpdateResult> => {
  try {
    // Prüfe ob Service Worker verfügbar ist
    if (!('serviceWorker' in navigator)) {
      // Verzögerter Hard-Refresh nach Modal-Anzeige
      setTimeout(forceReload, 2000);
      return { 
        status: 'unchanged',
        buildInfo: { message: 'Seite wird in 2 Sekunden neu geladen...' }
      };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      // Verzögerter Hard-Refresh nach Modal-Anzeige
      setTimeout(forceReload, 2000);
      return { 
        status: 'unchanged',
        buildInfo: { message: 'Seite wird in 2 Sekunden neu geladen...' }
      };
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

      // Verzögerter Reload nach Modal-Anzeige
      setTimeout(forceReload, 2000);
      
      return { 
        status: 'success',
        buildInfo: { message: 'Update installiert, Seite wird in 2 Sekunden neu geladen...' }
      };
    }

    // Kein neuer Service Worker, aber trotzdem Hard-Refresh durchführen
    // um sicherzustellen, dass alle Änderungen geladen werden
    setTimeout(forceReload, 2000);
    
    return { 
      status: 'unchanged',
      buildInfo: { message: 'Seite wird in 2 Sekunden aktualisiert...' }
    };

  } catch (error) {
    console.error('Update check failed:', error);
    // Auch bei Fehlern: Verzögerter Hard-Refresh
    setTimeout(forceReload, 2000);
    return { 
      status: 'fail',
      buildInfo: { message: 'Seite wird in 2 Sekunden neu geladen...' }
    };
  }
};