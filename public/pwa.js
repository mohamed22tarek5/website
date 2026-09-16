// ===============================
//  PWA Manager - pwa.js
//  Premium PWA installation and management
//  Author: Mohamed Tarek Abdelhady
// ===============================

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.stylesInjected = false;
    this.isIOSDevice = this.detectIOS();
    this.init();
  }

  init() {
    this.injectStyles();
    this.createInstallButton();
    this.registerServiceWorker();
    this.setupEventListeners();
    // iOS Safari has no install prompt event — offer manual steps instead.
    if (this.isIOSDevice && !this.isStandalone()) {
      this.showInstallButton();
    }
  }

  injectStyles() {
    if (this.stylesInjected) return;
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-btn {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        display: none;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        border: none;
        border-radius: 9999px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        z-index: 998;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
        opacity: 0;
        visibility: hidden;
      }
      .pwa-install-btn.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
        visibility: visible;
      }
      .pwa-install-btn:hover {
        transform: translateX(-50%) translateY(-2px);
        box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
      }
      .pwa-update-notification {
        position: fixed;
        top: 24px;
        right: 24px;
        background: #161b2e;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px;
        padding: 1.25rem 1.5rem;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        animation: pwaSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 320px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      @keyframes pwaSlideIn {
        from { opacity: 0; transform: translateX(24px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .pwa-update-notification .update-content p {
        color: #f1f5f9;
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
      .pwa-update-notification .update-btn {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        border: none;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        margin-right: 0.5rem;
        transition: all 150ms ease;
      }
      .pwa-update-notification .update-btn:hover {
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
      }
      .pwa-update-notification .dismiss-btn {
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 150ms ease;
      }
      .pwa-update-notification .dismiss-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #f1f5f9;
      }
      .network-status {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        padding: 0.75rem 1.5rem;
        border-radius: 9999px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 0.85rem;
        font-weight: 600;
        z-index: 10001;
        opacity: 0;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .network-status.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .network-status.success {
        background: rgba(34, 197, 94, 0.15);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
      }
      .network-status.warning {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.3);
        color: #f59e0b;
      }
      .pwa-toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 0.75rem 1.25rem;
        background: #161b2e;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        color: #f1f5f9;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        z-index: 10001;
        opacity: 0;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }
      .pwa-toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .pwa-toast.success { border-left: 3px solid #22c55e; }
      .pwa-toast.warning { border-left: 3px solid #f59e0b; }
      .pwa-toast.error { border-left: 3px solid #ef4444; }
      .pwa-toast.info { border-left: 3px solid #3b82f6; }
      .pwa-ios-install {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 1.5rem;
      }
      .ios-install-card {
        background: #161b2e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        max-width: 320px;
        color: #f1f5f9;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      .ios-install-card p { font-size: 1rem; margin-bottom: 0.75rem; }
      .ios-install-card ol {
        margin: 0 0 1rem 1.25rem;
        font-size: 0.875rem;
        line-height: 1.7;
        color: #94a3b8;
      }
      .ios-install-card .dismiss-btn {
        padding: 0.5rem 1.25rem;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        border: none;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
      }
      @media (prefers-reduced-motion: reduce) {
        .pwa-install-btn, .pwa-update-notification, .network-status, .pwa-toast {
          transition: none;
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
    this.stylesInjected = true;
  }

  createInstallButton() {
    const existingBtn = document.getElementById('installButton');
    if (existingBtn) existingBtn.remove();

    this.installButton = document.createElement('button');
    this.installButton.id = 'installButton';
    this.installButton.className = 'pwa-install-btn';
    this.installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
    this.installButton.setAttribute('aria-label', 'Install application');
    document.body.appendChild(this.installButton);

    this.installButton.addEventListener('click', () => this.installApp());
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          this.setupUpdateListener(registration);
        } catch (err) {
          console.log('SW registration failed:', err);
        }
      });
    }
  }

  setupUpdateListener(registration) {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          this.showUpdateNotification();
        }
      });
    });
  }

  setupEventListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.hideInstallButton();
      this.deferredPrompt = null;
      this.showToast('App installed successfully!', 'success');
    });

    window.addEventListener('online', () => {
      this.showStatusMessage('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.showStatusMessage('You are currently offline', 'warning');
    });
  }

  showInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'flex';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.installButton.classList.add('show');
        });
      });
    }
  }

  hideInstallButton() {
    if (this.installButton) {
      this.installButton.classList.remove('show');
      setTimeout(() => { this.installButton.style.display = 'none'; }, 300);
    }
  }

  async installApp() {
    // iOS has no beforeinstallprompt — guide the user instead.
    if (this.isIOSDevice) {
      this.showIOSInstallInstructions();
      return;
    }
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.hideInstallButton();
  }

  detectIOS() {
    const ua = navigator.userAgent || '';
    if (/iphone|ipad|ipod/i.test(ua)) return true;
    // iPadOS 13+ reports as MacIntel with touch support.
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  }

  showIOSInstallInstructions() {
    if (document.querySelector('.pwa-ios-install')) return;
    const el = document.createElement('div');
    el.className = 'pwa-ios-install';
    el.innerHTML = `
      <div class="ios-install-card" role="dialog" aria-label="How to install this app">
        <p><strong>Install this app</strong></p>
        <ol>
          <li>Tap the <strong>Share</strong> button in Safari</li>
          <li>Choose <strong>Add to Home Screen</strong></li>
          <li>Tap <strong>Add</strong></li>
        </ol>
        <button class="dismiss-btn">Got it</button>
      </div>
    `;
    el.querySelector('.dismiss-btn').addEventListener('click', () => el.remove());
    el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
    document.body.appendChild(el);
  }

  showUpdateNotification() {
    const existing = document.querySelector('.pwa-update-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content">
        <p>New version available!</p>
        <button class="update-btn">Update Now</button>
        <button class="dismiss-btn">Later</button>
      </div>
    `;

    notification.querySelector('.update-btn').addEventListener('click', () => this.updateApp());
    notification.querySelector('.dismiss-btn').addEventListener('click', () => notification.remove());

    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentNode) notification.remove(); }, 15000);
  }

  updateApp() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    window.location.reload();
  }

  showStatusMessage(message, type) {
    const existing = document.querySelector('.network-status');
    if (existing) existing.remove();

    const statusEl = document.createElement('div');
    statusEl.className = `network-status ${type}`;
    statusEl.textContent = message;
    document.body.appendChild(statusEl);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        statusEl.classList.add('show');
      });
    });

    setTimeout(() => {
      statusEl.classList.remove('show');
      setTimeout(() => { if (statusEl.parentNode) statusEl.remove(); }, 300);
    }, 3000);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `pwa-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    }, 3000);
  }

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
  }
}

const pwaManager = new PWAManager();

window.PWA = {
  install: () => pwaManager.installApp(),
  update: () => pwaManager.updateApp(),
  isStandalone: () => pwaManager.isStandalone()
};