import { useCallback, useState } from 'react';
import { checkAndInstallUpdate } from '../utils/updateManager';

interface UseUpdateServiceParams {
  setUpdateInfoStatus: React.Dispatch<React.SetStateAction<'success' | 'fail' | 'unchanged'>>;
  setUpdateBuildInfo: React.Dispatch<React.SetStateAction<any>>;
  setIsUpdateInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useUpdateService = ({
  setUpdateInfoStatus,
  setUpdateBuildInfo,
  setIsUpdateInfoModalOpen,
}: UseUpdateServiceParams) => {
  const handleUpdate = useCallback(async () => {
    try {
      const result = await checkAndInstallUpdate();
      setUpdateInfoStatus(result.status);
      setUpdateBuildInfo(result.buildInfo || null);
      setIsUpdateInfoModalOpen(true);
    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateInfoStatus('fail');
      setUpdateBuildInfo(null);
      setIsUpdateInfoModalOpen(true);
    }
  }, [setUpdateInfoStatus, setUpdateBuildInfo, setIsUpdateInfoModalOpen]);

  return {
    handleUpdate,
  };
};

// Fallback für einfache Verwendung ohne Hook
export const checkForUpdates = async (): Promise<string> => {
  try {
    const result = await checkAndInstallUpdate();

    switch (result.status) {
      case 'success':
        return 'Auf neue Version installiert';
      case 'unchanged':
        return 'Sie verwenden bereits die neueste Version';
      case 'fail':
      default:
        return 'Server nicht erreichbar';
    }
  } catch (error) {
    return 'Server nicht erreichbar';
  }
};

export const installPWA = (): Promise<string> => {
  return new Promise((resolve) => {
    // Prüfe ob PWA-Installation möglich ist
    if ('serviceWorker' in navigator) {
      // Prüfe ob bereits installiert
      if (window.matchMedia('(display-mode: standalone)').matches) {
        resolve('App ist bereits installiert');
        return;
      }

      // Prüfe ob Installation verfügbar ist
      const deferredPrompt = (window as any).deferredPrompt;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            resolve('App wurde erfolgreich installiert');
          } else {
            resolve('Installation wurde abgebrochen');
          }
          (window as any).deferredPrompt = null;
        });
      } else {
        resolve('Installation nicht verfügbar. Nutzen Sie "Zur Startseite hinzufügen" in Ihrem Browser-Menü.');
      }
    } else {
      resolve('PWA wird von diesem Browser nicht unterstützt');
    }
  });
};