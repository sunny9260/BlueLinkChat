// PWA Service Worker Registration and Update Management

export interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if already installed
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPrompt;
      this.dispatchInstallAvailable();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.dispatchInstalled();
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.dispatchUpdateAvailable();
              }
            });
          }
        });

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

      } catch (error) {
        console.log('Service worker registration failed:', error);
      }
    }
  }

  // Install the PWA
  async install(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    }

    return false;
  }

  // Update the app
  async update(): Promise<void> {
    if (!this.registration?.waiting) return;

    // Tell the waiting service worker to skip waiting and become active
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Check if install is available
  canInstall(): boolean {
    return !!this.deferredPrompt && !this.isInstalled;
  }

  // Check if app is installed
  getIsInstalled(): boolean {
    return this.isInstalled;
  }

  // Check if update is available
  getUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  // Custom events
  private dispatchInstallAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private dispatchInstalled() {
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  private dispatchUpdateAvailable() {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }
}

// Export singleton instance
export const pwaManager = new PWAManager();