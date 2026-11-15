/**
 * Mohamed Tarek Abdelhady Portfolio — Progressive Web App Controller
 * Full support for Mobile Android, Mobile iOS (iPhone & iPad), and Desktop PWA
 * Version: 2.0.0
 */

(function () {
  'use strict';

  class PWAManager {
    constructor() {
      this.deferredPrompt = null;
      this.swRegistration = null;
      this.isIOS = this.detectIOS();
      this.isAndroid = this.detectAndroid();
      this.isStandaloneMode = this.checkStandalone();
      this.wakeLock = null;

      this.init();
    }

    init() {
      this.injectStyles();
      this.applyStandaloneClasses();
      this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupNetworkMonitoring();
      this.setupLinkHandling();
      this.attachInstallTriggers();

      // If on iOS and not yet installed, prepare iOS guide
      if (this.isIOS && !this.isStandaloneMode) {
        this.setupIOSInstallGuide();
      }
    }

    /* ----------------------------------------------------
       DEVICE & ENVIRONMENT DETECTION
       ---------------------------------------------------- */
    detectIOS() {
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const isAppleDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      return isAppleDevice || isIPadOS;
    }

    detectAndroid() {
      const ua = navigator.userAgent || '';
      return /android/i.test(ua);
    }

    checkStandalone() {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      );
    }

    applyStandaloneClasses() {
      if (this.isStandaloneMode) {
        document.documentElement.classList.add('pwa-standalone');
        document.body.classList.add('is-standalone-pwa');
      }
    }

    /* ----------------------------------------------------
       STYLES INJECTION
       ---------------------------------------------------- */
    injectStyles() {
      if (document.getElementById('pwa-dynamic-styles')) return;

      const style = document.createElement('style');
      style.id = 'pwa-dynamic-styles';
      style.textContent = `
        /* PWA Floating Install Button */
        .pwa-floating-btn {
          position: fixed;
          bottom: max(20px, calc(16px + env(safe-area-inset-bottom)));
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          z-index: 9999;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          transform: translateY(100px);
          opacity: 0;
          visibility: hidden;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, visibility 0.3s ease;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .pwa-floating-btn.visible {
          transform: translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .pwa-floating-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .pwa-floating-btn svg {
          width: 16px;
          height: 16px;
          fill: currentColor;
        }

        /* iOS Installation Bottom Sheet / Modal */
        .pwa-ios-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 100000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          padding: 16px;
          box-sizing: border-box;
        }

        .pwa-ios-backdrop.active {
          opacity: 1;
          visibility: visible;
        }

        .pwa-ios-sheet {
          background: #111827;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          width: 100%;
          max-width: 440px;
          padding: 24px 20px 20px;
          color: #f3f4f6;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-sizing: border-box;
          margin-bottom: max(10px, env(safe-area-inset-bottom));
        }

        .pwa-ios-backdrop.active .pwa-ios-sheet {
          transform: translateY(0);
        }

        .pwa-ios-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .pwa-ios-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #0a0e1a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .pwa-ios-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pwa-ios-title-wrap h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
        }

        .pwa-ios-title-wrap p {
          margin: 2px 0 0;
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .pwa-ios-steps {
          margin: 0 0 20px;
          padding: 0;
          list-style: none;
          display: flex;
          flex-col;
          gap: 12px;
          flex-direction: column;
        }

        .pwa-ios-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255, 255, 255, 0.04);
          padding: 10px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.85rem;
          line-height: 1.45;
          color: #e5e7eb;
        }

        .pwa-ios-step-num {
          background: #2563eb;
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pwa-ios-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 600;
          color: #ffffff;
        }

        .pwa-ios-badge svg {
          width: 14px;
          height: 14px;
          fill: currentColor;
          display: inline-block;
          vertical-align: -2px;
        }

        .pwa-ios-actions {
          display: flex;
          gap: 10px;
        }

        .pwa-ios-close-btn {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .pwa-ios-close-btn:active {
          opacity: 0.85;
        }

        /* Update Notification Pill */
        .pwa-update-banner {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          right: 16px;
          background: #111827;
          border: 1px solid rgba(59, 130, 246, 0.4);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          padding: 14px 18px;
          z-index: 100001;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f3f4f6;
          max-width: 340px;
          animation: pwaSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pwaSlideDown {
          from { transform: translateY(-40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .pwa-update-banner p {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .pwa-update-actions {
          display: flex;
          gap: 6px;
        }

        .pwa-update-btn {
          padding: 6px 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .pwa-dismiss-btn {
          padding: 6px 10px;
          background: transparent;
          color: #9ca3af;
          border: none;
          font-size: 0.8rem;
          cursor: pointer;
        }

        /* Status Toast */
        .pwa-status-toast {
          position: fixed;
          top: max(16px, env(safe-area-inset-top));
          left: 50%;
          transform: translateX(-50%) translateY(-30px);
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          z-index: 100002;
          opacity: 0;
          visibility: hidden;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          pointer-events: none;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pwa-status-toast.visible {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
          visibility: visible;
        }

        .pwa-status-toast.online {
          background: rgba(34, 197, 94, 0.9);
          color: #ffffff;
        }

        .pwa-status-toast.offline {
          background: rgba(239, 68, 68, 0.9);
          color: #ffffff;
        }

        /* Standalone mode iOS Safe Area Enhancements */
        @media all and (display-mode: standalone) {
          body {
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
          }
          .pwa-floating-btn {
            display: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    /* ----------------------------------------------------
       SERVICE WORKER REGISTRATION & LIFECYCLE
       ---------------------------------------------------- */
    registerServiceWorker() {
      if (!('serviceWorker' in navigator)) return;

      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          this.swRegistration = reg;

          // Check if worker update found
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateBanner();
              }
            });
          });

          // Check for SW updates when returning to the tab
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          });
        } catch (err) {
          // SW registration silent handle
        }
      });

      // Reload on controllerchange when updated
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    showUpdateBanner() {
      if (document.getElementById('pwa-update-banner')) return;

      const banner = document.createElement('div');
      banner.id = 'pwa-update-banner';
      banner.className = 'pwa-update-banner';
      banner.setAttribute('role', 'alert');
      banner.innerHTML = `
        <div style="flex:1">
          <p><strong>Update Ready</strong></p>
          <p style="color:#9ca3af;font-size:0.78rem">A new version is available.</p>
        </div>
        <div class="pwa-update-actions">
          <button class="pwa-update-btn" id="pwa-btn-reload">Update</button>
          <button class="pwa-dismiss-btn" id="pwa-btn-dismiss">Later</button>
        </div>
      `;

      document.body.appendChild(banner);

      document.getElementById('pwa-btn-reload')?.addEventListener('click', () => {
        if (this.swRegistration?.waiting) {
          this.swRegistration.waiting.postMessage({ action: 'skipWaiting' });
        } else {
          window.location.reload();
        }
      });

      document.getElementById('pwa-btn-dismiss')?.addEventListener('click', () => {
        banner.remove();
      });
    }

    /* ----------------------------------------------------
       ANDROID & CHROMIUM INSTALL PROMPT
       ---------------------------------------------------- */
    setupInstallPrompt() {
      // Listen for Android/Chrome beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallUI();
      });

      // Track installation completion
      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.hideInstallUI();
        this.showToast('App installed to your device!', 'online');
        try {
          localStorage.setItem('pwa-installed', 'true');
        } catch (e) {}
      });
    }

    showInstallUI() {
      // 1. Reveal page-level install buttons if present
      const inPageBtns = document.querySelectorAll('#pwaInstallBtn, [data-pwa-install]');
      inPageBtns.forEach((btn) => {
        btn.classList.add('show');
        btn.style.display = 'flex';
      });

      // 2. Reveal or create floating button
      let floatBtn = document.getElementById('pwa-floating-install-btn');
      if (!floatBtn && !this.isStandaloneMode) {
        floatBtn = document.createElement('button');
        floatBtn.id = 'pwa-floating-install-btn';
        floatBtn.className = 'pwa-floating-btn';
        floatBtn.setAttribute('aria-label', 'Install Portfolio App');
        floatBtn.innerHTML = `
          <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
          <span>Install App</span>
        `;
        document.body.appendChild(floatBtn);
        floatBtn.addEventListener('click', () => this.triggerInstall());
      }

      if (floatBtn) {
        requestAnimationFrame(() => {
          floatBtn.classList.add('visible');
        });
      }
    }

    hideInstallUI() {
      const floatBtn = document.getElementById('pwa-floating-install-btn');
      if (floatBtn) {
        floatBtn.classList.remove('visible');
        setTimeout(() => floatBtn.remove(), 400);
      }
      const inPageBtns = document.querySelectorAll('#pwaInstallBtn, [data-pwa-install]');
      inPageBtns.forEach((btn) => btn.classList.remove('show'));
    }

    async triggerInstall() {
      // If iOS, display step-by-step guidance
      if (this.isIOS) {
        this.openIOSGuide();
        return;
      }

      // If Chromium deferredPrompt exists
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          this.hideInstallUI();
        }
        this.deferredPrompt = null;
      } else {
        // Fallback info toast
        this.showToast('To install: open browser menu and select "Install" or "Add to Home Screen".', 'online');
      }
    }

    attachInstallTriggers() {
      document.addEventListener('click', (e) => {
        const target = e.target.closest('#pwaInstallBtn, [data-pwa-install]');
        if (target) {
          e.preventDefault();
          this.triggerInstall();
        }
      });
    }

    /* ----------------------------------------------------
       IOS SAFARI INSTALLATION GUIDE
       ---------------------------------------------------- */
    setupIOSInstallGuide() {
      // Attach to any in-page install button to reveal iOS sheet
      const inPageBtns = document.querySelectorAll('#pwaInstallBtn, [data-pwa-install]');
      inPageBtns.forEach((btn) => {
        btn.classList.add('show');
        btn.style.display = 'flex';
      });

      // Show subtle floating install button on iOS if not dismissed before
      let hasSeenIOSPrompt = false;
      try {
        hasSeenIOSPrompt = localStorage.getItem('pwa-ios-dismissed') === 'true';
      } catch (e) {}

      if (!hasSeenIOSPrompt && !this.isStandaloneMode) {
        // Auto-show floating button after 3 seconds
        setTimeout(() => {
          let floatBtn = document.getElementById('pwa-floating-install-btn');
          if (!floatBtn) {
            floatBtn = document.createElement('button');
            floatBtn.id = 'pwa-floating-install-btn';
            floatBtn.className = 'pwa-floating-btn';
            floatBtn.setAttribute('aria-label', 'Install Portfolio on iOS');
            floatBtn.innerHTML = `
              <svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/></svg>
              <span>Install on iPhone</span>
            `;
            document.body.appendChild(floatBtn);
            floatBtn.addEventListener('click', () => this.openIOSGuide());
          }
          floatBtn.classList.add('visible');
        }, 3000);
      }
    }

    openIOSGuide() {
      let backdrop = document.getElementById('pwa-ios-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'pwa-ios-backdrop';
        backdrop.className = 'pwa-ios-backdrop';
        backdrop.innerHTML = `
          <div class="pwa-ios-sheet" role="dialog" aria-modal="true" aria-label="Install App on iOS">
            <div class="pwa-ios-header">
              <div class="pwa-ios-icon">
                <img src="/icon-192.png" alt="App Icon">
              </div>
              <div class="pwa-ios-title-wrap">
                <h3>Install on iPhone & iPad</h3>
                <p>Fast offline access to engineering tools</p>
              </div>
            </div>
            <ul class="pwa-ios-steps">
              <li class="pwa-ios-step">
                <span class="pwa-ios-step-num">1</span>
                <div>
                  Tap the <span class="pwa-ios-badge"><svg viewBox="0 0 24 24"><path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/></svg> Share</span> button at the bottom of Safari.
                </div>
              </li>
              <li class="pwa-ios-step">
                <span class="pwa-ios-step-num">2</span>
                <div>
                  Scroll down and select <span class="pwa-ios-badge"><svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg> Add to Home Screen</span>.
                </div>
              </li>
              <li class="pwa-ios-step">
                <span class="pwa-ios-step-num">3</span>
                <div>
                  Tap <span class="pwa-ios-badge">Add</span> in the top-right corner to finish.
                </div>
              </li>
            </ul>
            <div class="pwa-ios-actions">
              <button class="pwa-ios-close-btn" id="pwa-ios-btn-close">Got it</button>
            </div>
          </div>
        `;
        document.body.appendChild(backdrop);

        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) this.closeIOSGuide();
        });

        document.getElementById('pwa-ios-btn-close')?.addEventListener('click', () => {
          this.closeIOSGuide();
          try {
            localStorage.setItem('pwa-ios-dismissed', 'true');
          } catch (e) {}
        });
      }

      requestAnimationFrame(() => {
        backdrop.classList.add('active');
      });
    }

    closeIOSGuide() {
      const backdrop = document.getElementById('pwa-ios-backdrop');
      if (backdrop) {
        backdrop.classList.remove('active');
      }
    }

    /* ----------------------------------------------------
       NETWORK MONITORING & TOASTS
       ---------------------------------------------------- */
    setupNetworkMonitoring() {
      window.addEventListener('online', () => {
        this.showToast('🌐 Connection restored', 'online');
      });

      window.addEventListener('offline', () => {
        this.showToast('⚡ Offline Mode: Cached content available', 'offline');
      });
    }

    showToast(message, type = 'online') {
      let toast = document.getElementById('pwa-status-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'pwa-status-toast';
        toast.className = 'pwa-status-toast';
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.className = `pwa-status-toast ${type} visible`;

      clearTimeout(this._toastTimeout);
      this._toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, 3500);
    }

    /* ----------------------------------------------------
       IOS STANDALONE LINK INTERCEPTION
       ---------------------------------------------------- */
    setupLinkHandling() {
      // Prevent iOS Safari standalone mode from bouncing out to browser on internal navigation
      if (this.isIOS && this.isStandaloneMode) {
        document.addEventListener('click', (e) => {
          const a = e.target.closest('a');
          if (!a) return;
          const href = a.getAttribute('href');
          if (!href) return;

          // Only intercept local relative or same-origin URLs
          if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || a.target === '_blank') {
            return;
          }

          if (href.startsWith('/') || href.startsWith(window.location.origin)) {
            e.preventDefault();
            window.location.href = href;
          }
        });
      }
    }

    /* ----------------------------------------------------
       PUBLIC PWA UTILITIES (Web Share, Wake Lock, Haptics)
       ---------------------------------------------------- */
    async share(data = {}) {
      const shareData = {
        title: data.title || document.title,
        text: data.text || 'Explore engineering projects & tools by Mohamed Tarek Abdelhady',
        url: data.url || window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return true;
        } catch (err) {
          if (err.name !== 'AbortError') {
            this.copyToClipboard(shareData.url);
          }
        }
      } else {
        this.copyToClipboard(shareData.url);
      }
      return false;
    }

    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('🔗 Link copied to clipboard!', 'online');
      } catch (e) {
        this.showToast('Share: ' + text, 'online');
      }
    }

    vibrate(pattern = [15]) {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
        } catch (e) {}
      }
    }

    async requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          this.wakeLock = await navigator.wakeLock.request('screen');
          this.showToast('💡 Screen Wake Lock Active', 'online');
          this.wakeLock.addEventListener('release', () => {
            this.wakeLock = null;
          });
          return true;
        } catch (err) {
          // Wake lock rejected
        }
      }
      return false;
    }

    releaseWakeLock() {
      if (this.wakeLock) {
        this.wakeLock.release();
        this.wakeLock = null;
      }
    }

    setBadge(count) {
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(count).catch(() => {});
      }
    }

    clearBadge() {
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }

  // Initialize and attach to global window
  const manager = new PWAManager();
  window.PWA = {
    install: () => manager.triggerInstall(),
    openIOSGuide: () => manager.openIOSGuide(),
    share: (data) => manager.share(data),
    vibrate: (pattern) => manager.vibrate(pattern),
    requestWakeLock: () => manager.requestWakeLock(),
    releaseWakeLock: () => manager.releaseWakeLock(),
    setBadge: (count) => manager.setBadge(count),
    clearBadge: () => manager.clearBadge(),
    isStandalone: () => manager.checkStandalone(),
    isIOS: manager.isIOS,
    isAndroid: manager.isAndroid
  };
})();
