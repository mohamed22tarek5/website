// PWA Installation and Management
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    this.createInstallButton();
    this.registerServiceWorker();
    this.setupEventListeners();
  }

  createInstallButton() {
    // Remove existing install button if any
    const existingBtn = document.getElementById('installButton');
    if (existingBtn) {
      existingBtn.remove();
    }

    this.installButton = document.createElement('button');
    this.installButton.id = 'installButton';
    this.installButton.className = 'pwa-install-btn';
    this.installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
    this.installButton.style.display = 'none';
    
    document.body.appendChild(this.installButton);

    this.installButton.addEventListener('click', () => {
      this.installApp();
    });
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered: ', registration);

          this.setupUpdateListener(registration);
        } catch (registrationError) {
          console.log('Service Worker registration failed: ', registrationError);
        }
      });
    }
  }

  setupUpdateListener(registration) {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Service Worker update found!');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateNotification();
        }
      });
    });
  }

  setupEventListeners() {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
      this.deferredPrompt = null;
      this.showToast('App installed successfully!', 'success');
    });

    // Network status
    window.addEventListener('online', () => {
      this.showStatusMessage('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.showStatusMessage('You are currently offline', 'warning');
    });
  }

  showInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'block';
      setTimeout(() => {
        this.installButton.classList.add('show');
      }, 100);
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.classList.remove('show');
      setTimeout(() => {
        this.installButton.style.display = 'none';
      }, 300);
    }
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>New version available!</p>
        <button class="update-btn" onclick="pwaManager.updateApp()">Update Now</button>
        <button class="dismiss-btn" onclick="this.parentElement.parentElement.remove()">Later</button>
      </div>
    `;
    
    document.body.appendChild(notification);

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 15000);
  }

  updateApp() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    window.location.reload();
  }

  showStatusMessage(message, type) {
    // Remove existing status message
    const existing = document.querySelector('.network-status');
    if (existing) {
      existing.remove();
    }

    const statusEl = document.createElement('div');
    statusEl.className = `network-status ${type}`;
    statusEl.textContent = message;
    
    document.body.appendChild(statusEl);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.remove();
      }
    }, 3000);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `pwa-toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  }

  // Check if app is running in standalone mode
  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }
}

// Initialize PWA Manager
const pwaManager = new PWAManager();

// Export for global access
window.PWA = {
  install: () => pwaManager.installApp(),
  update: () => pwaManager.updateApp(),
  isStandalone: () => pwaManager.isStandalone()
};