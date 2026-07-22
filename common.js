/* ============================================
   COMMON.JS — Shared JavaScript
   Mohamed Tarek Portfolio
   
   Extract shared functionality to eliminate
   code duplication across pages.
   ============================================ */

(() => {
  'use strict';

  /* ----------------------------------------
     LOADING SCREEN
     ---------------------------------------- */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
      }, 400);
    });
  }

  /* ----------------------------------------
     SCROLL PROGRESS BAR
     ---------------------------------------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const updateScrollProgress = () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  };

  /* ----------------------------------------
     HEADER SCROLL STATE
     ---------------------------------------- */
  const header = document.getElementById('header');
  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  /* ----------------------------------------
     BACK TO TOP
     ---------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  const updateBackToTop = () => {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', window.scrollY > 400);
  };
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------
     ACTIVE NAV LINK (for single-page sections)
     ---------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const updateActiveLink = () => {
    const scrollY = window.scrollY + 200;
    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  };

  /* ----------------------------------------
     SCROLL EVENT (throttled via rAF)
     ---------------------------------------- */
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateHeader();
        updateBackToTop();
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ----------------------------------------
     MOBILE MENU
     ---------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (menuToggle && navMenu && mobileOverlay) {
    const toggleMenu = () => {
      const isActive = navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(isActive));
      mobileOverlay.classList.toggle('active');
      document.body.style.overflow = isActive ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) toggleMenu();
      });
    });
  }

  /* ----------------------------------------
     THEME TOGGLE
     ---------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const STORAGE_KEY = 'portfolio-theme';

    const getPreferredTheme = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    };

    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
      }
      localStorage.setItem(STORAGE_KEY, theme);
    };

    applyTheme(getPreferredTheme());

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ----------------------------------------
     SCROLL REVEAL (IntersectionObserver)
     ---------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ----------------------------------------
     ANIMATED COUNTERS
     ---------------------------------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const duration = 2000;
          const start = performance.now();

          const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + (progress >= 1 ? '+' : '');
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ----------------------------------------
     FOOTER YEAR
     ---------------------------------------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------
     PWA FUNCTIONALITY
     ---------------------------------------- */
  let deferredPrompt = null;
  const pwaInstallBtn = document.getElementById('pwaInstallBtn');
  const offlineIndicator = document.getElementById('offlineIndicator');

  if (pwaInstallBtn) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      pwaInstallBtn.classList.add('show');
    });

    pwaInstallBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        pwaInstallBtn.classList.remove('show');
        showToast('App installed successfully!', 'success');
      }
      deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
      pwaInstallBtn.classList.remove('show');
      deferredPrompt = null;
    });
  }

  /* ----------------------------------------
     NETWORK STATUS
     ---------------------------------------- */
  if (offlineIndicator) {
    window.addEventListener('online', () => {
      offlineIndicator.classList.remove('show');
      showToast('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
      offlineIndicator.classList.add('show');
    });
  }

  /* ----------------------------------------
     TOAST NOTIFICATIONS
     ---------------------------------------- */
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ----------------------------------------
     SERVICE WORKER
     ---------------------------------------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          });
        })
        .catch(err => console.error('SW registration failed:', err));
    });
  }

  function showUpdateNotification() {
    const el = document.createElement('div');
    el.className = 'pwa-update-notification';
    el.innerHTML = `
      <p>New update available!</p>
      <div class="btn-group">
        <button class="btn btn-primary" style="padding:8px 16px;font-size:0.8125rem;" onclick="window.location.reload()">Update</button>
        <button class="btn btn-ghost" style="padding:8px 16px;font-size:0.8125rem;color:var(--color-text-secondary);" onclick="this.closest('.pwa-update-notification').remove()">Later</button>
      </div>
    `;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 15000);
  }

  /* ----------------------------------------
     GLOW EFFECT ON CARDS (mouse tracking)
     ---------------------------------------- */
  document.querySelectorAll('.skill-card, .service-card, .project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  /* ----------------------------------------
     SMOOTH SCROLL FOR ANCHOR LINKS
     ---------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
