// PWA Installation and Management
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.BLUE_COLOR = '#3a6cf4'; // Use your manifest blue color
    this.LIGHT_BLUE_BG = '#f0f5ff'; // Light blue background
    this.init();
  }

  init() {
    this.createInstallButton();
    this.registerServiceWorker();
    this.setupEventListeners();
    this.forceBlueTheme();
  }

  createInstallButton() {
    const existingBtn = document.getElementById('installButton');
    if (existingBtn) {
      existingBtn.remove();
    }

    this.installButton = document.createElement('button');
    this.installButton.id = 'installButton';
    this.installButton.className = 'pwa-install-btn';
    this.installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
    this.installButton.style.display = 'none';
    
    // USE YOUR BLUE COLOR
    this.installButton.style.backgroundColor = this.BLUE_COLOR;
    this.installButton.style.color = '#ffffff';
    this.installButton.style.border = 'none';
    this.installButton.style.padding = '12px 24px';
    this.installButton.style.borderRadius = '8px';
    this.installButton.style.fontWeight = '600';
    this.installButton.style.fontSize = '16px';
    this.installButton.style.cursor = 'pointer';
    this.installButton.style.boxShadow = '0 4px 12px rgba(58, 108, 244, 0.3)';
    this.installButton.style.transition = 'all 0.3s ease';
    this.installButton.style.position = 'fixed';
    this.installButton.style.bottom = '20px';
    this.installButton.style.right = '20px';
    this.installButton.style.zIndex = '9999';
    
    // Hover effect
    this.installButton.addEventListener('mouseenter', () => {
      this.installButton.style.transform = 'translateY(-2px)';
      this.installButton.style.boxShadow = '0 6px 16px rgba(58, 108, 244, 0.4)';
    });
    
    this.installButton.addEventListener('mouseleave', () => {
      this.installButton.style.transform = 'translateY(0)';
      this.installButton.style.boxShadow = '0 4px 12px rgba(58, 108, 244, 0.3)';
    });
    
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
      this.applyThemeToDocument();
    });

    // Network status
    window.addEventListener('online', () => {
      this.showStatusMessage('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.showStatusMessage('You are currently offline', 'warning');
    });
    
    // Listen for theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      this.forceBlueTheme();
    });
    
    // Force theme on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.forceBlueTheme();
      }
    });
  }

  // Force blue theme
  forceBlueTheme() {
    // Create or update theme style
    let themeStyle = document.getElementById('pwa-theme-style');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'pwa-theme-style';
      document.head.appendChild(themeStyle);
    }
    
    // Force blue theme regardless of system preference
    themeStyle.textContent = `
      /* Force light blue background - matches your brand */
      body, html {
        background-color: ${this.LIGHT_BLUE_BG} !important;
        color: #333333 !important;
        min-height: 100vh;
      }
      
      /* Override dark mode */
      @media (prefers-color-scheme: dark) {
        body, html {
          background-color: ${this.LIGHT_BLUE_BG} !important;
          color: #333333 !important;
        }
      }
      
      /* Apply blue theme to common elements */
      .pwa-toast {
        background-color: ${this.BLUE_COLOR} !important;
        color: white !important;
      }
      
      .network-status.success {
        background-color: ${this.BLUE_COLOR} !important;
        color: white !important;
      }
      
      .network-status.warning {
        background-color: #ffc107 !important;
        color: #000000 !important;
      }
      
      .pwa-update-notification {
        background-color: ${this.BLUE_COLOR} !important;
        color: white !important;
      }
    `;
    
    // Set theme-color meta tag to match manifest
    this.setThemeColorMeta(this.BLUE_COLOR);
    
    // Apply blue theme to existing elements
    this.applyThemeToDocument();
  }
  
  // Set theme color meta tag
  setThemeColorMeta(color) {
    // Remove existing theme-color meta tags
    const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
    existingMetas.forEach(meta => meta.remove());
    
    // Add new theme-color meta tag
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }
  
  // Apply theme to existing document elements
  applyThemeToDocument() {
    // Ensure body has correct background
    document.body.style.backgroundColor = this.LIGHT_BLUE_BG;
    document.body.style.color = '#333333';
    
    // Apply to html element too
    document.documentElement.style.backgroundColor = this.LIGHT_BLUE_BG;
    
    // Update any status/notification elements
    document.querySelectorAll('.network-status, .pwa-toast, .pwa-update-notification').forEach(el => {
      if (el.classList.contains('success') || !el.classList.contains('warning')) {
        el.style.backgroundColor = this.BLUE_COLOR;
        el.style.color = '#ffffff';
      }
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
        this.showToast('Installing app...', 'success');
      } else {
        console.log('User dismissed the install prompt');
        this.showToast('Installation cancelled', 'info');
      }
      
      this.deferredPrompt = null;
      this.hideInstallButton();
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.innerHTML = `
      <div class="update-content" style="display: flex; flex-direction: column; gap: 10px;">
        <p style="margin: 0; font-weight: 600;">New version available!</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">Update to get the latest features</p>
        <div style="display: flex; gap: 10px;">
          <button class="update-btn" style="
            background: white;
            color: ${this.BLUE_COLOR};
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            flex: 1;
          " onclick="pwaManager.updateApp()">Update Now</button>
          <button class="dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            flex: 1;
          " onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
        </div>
      </div>
    `;
    
    // Styling for notification
    notification.style.backgroundColor = this.BLUE_COLOR;
    notification.style.color = '#ffffff';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '12px';
    notification.style.margin = '15px';
    notification.style.boxShadow = '0 6px 20px rgba(58, 108, 244, 0.25)';
    notification.style.position = 'fixed';
    notification.style.bottom = '70px';
    notification.style.right = '20px';
    notification.style.zIndex = '9998';
    notification.style.maxWidth = '320px';
    notification.style.animation = 'slideInUp 0.3s ease';
    
    // Add animation style if not exists
    if (!document.querySelector('#pwa-animations')) {
      const style = document.createElement('style');
      style.id = 'pwa-animations';
      style.textContent = `
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 15000);
  }

  updateApp() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    this.showToast('Updating app...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  showStatusMessage(message, type) {
    const existing = document.querySelector('.network-status');
    if (existing) {
      existing.remove();
    }

    const statusEl = document.createElement('div');
    statusEl.className = `network-status ${type}`;
    statusEl.textContent = message;
    
    // Styling
    if (type === 'success') {
      statusEl.style.backgroundColor = this.BLUE_COLOR;
      statusEl.style.color = '#ffffff';
    } else if (type === 'warning') {
      statusEl.style.backgroundColor = '#ffc107';
      statusEl.style.color = '#000000';
    }
    
    statusEl.style.padding = '12px 20px';
    statusEl.style.borderRadius = '8px';
    statusEl.style.margin = '10px';
    statusEl.style.position = 'fixed';
    statusEl.style.bottom = '20px';
    statusEl.style.left = '20px';
    statusEl.style.right = '20px';
    statusEl.style.zIndex = '9997';
    statusEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    statusEl.style.textAlign = 'center';
    statusEl.style.fontWeight = '500';
    statusEl.style.animation = 'slideInUp 0.3s ease';
    
    document.body.appendChild(statusEl);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (statusEl.parentNode) {
        statusEl.style.opacity = '0';
        statusEl.style.transform = 'translateY(10px)';
        statusEl.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          if (statusEl.parentNode) {
            statusEl.remove();
          }
        }, 300);
      }
    }, 3000);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `pwa-toast ${type}`;
    toast.textContent = message;
    
    // Styling
    toast.style.backgroundColor = this.BLUE_COLOR;
    toast.style.color = '#ffffff';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '10px';
    toast.style.position = 'fixed';
    toast.style.bottom = '80px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 6px 20px rgba(58, 108, 244, 0.25)';
    toast.style.textAlign = 'center';
    toast.style.fontWeight = '500';
    toast.style.maxWidth = '90%';
    toast.style.width = 'auto';
    toast.style.whiteSpace = 'nowrap';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-10px)';
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
  isStandalone: () => pwaManager.isStandalone(),
  forceBlueTheme: () => pwaManager.forceBlueTheme()
};

// Force blue theme on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pwaManager.forceBlueTheme();
  });
} else {
  pwaManager.forceBlueTheme();
}

// Also force theme when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    pwaManager.forceBlueTheme();
  }
});