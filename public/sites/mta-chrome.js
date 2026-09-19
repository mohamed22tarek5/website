/**
 * MTA-CHROME.JS — Shared chrome behavior for public/sites/ pages.
 *
 * - Owns clicks on [data-mta-toggle] (theme) and [data-mta-top] (scroll top).
 * - Cooperates with legacy per-page handlers: they toggle
 *   documentElement.dataset.theme; a MutationObserver re-syncs icons
 *   and persists the choice, so header/footer/page icons never desync.
 * - Persists under the same key legacy pages use: 'portfolio-theme'.
 * - Fills #currentYear spans that legacy scripts may not cover.
 */
(function () {
  'use strict';

  var KEY = 'portfolio-theme';
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function paintIcon(el, theme) {
    // el is the <i> placeholder (or its wrapper)
    var icon = el;
    if (icon && icon.tagName !== 'I' && icon.querySelector) {
      icon = icon.querySelector('i');
    }
    if (!icon) return;
    icon.classList.remove('fa-moon', 'fa-sun');
    icon.classList.add(theme === 'light' ? 'fa-sun' : 'fa-moon');
  }

  function syncAllIcons() {
    var theme = currentTheme();
    var seen = [];
    var icons = document.querySelectorAll('[data-mta-icon]');
    for (var i = 0; i < icons.length; i++) { paintIcon(icons[i], theme); seen.push(icons[i]); }
    // Legacy per-page handlers rewrite icon className (dropping data-mta-icon),
    // so also track header toggle icons by ID.
    var extra = document.querySelectorAll('#themeToggle i, #th i');
    for (var j = 0; j < extra.length; j++) {
      if (seen.indexOf(extra[j]) === -1) paintIcon(extra[j], theme);
    }
  }

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
    if (persist !== false) {
      try { localStorage.setItem(KEY, currentTheme()); } catch (e) { /* private mode */ }
    }
    syncAllIcons();
  }

  function init() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (saved === 'light' || saved === 'dark') {
      root.setAttribute('data-theme', saved);
    } else if (!root.getAttribute('data-theme')) {
      root.setAttribute('data-theme', 'dark');
    }
    syncAllIcons();

    // Fill year spans (legacy pages set their own; harmless if repeated)
    var year = String(new Date().getFullYear());
    var spans = document.querySelectorAll('#currentYear');
    for (var s = 0; s < spans.length; s++) {
      if (!spans[s].textContent || !/\d{4}/.test(spans[s].textContent)) {
        spans[s].textContent = year;
      }
    }

    // Keep icons + storage in sync when legacy handlers toggle the theme
    if (window.MutationObserver) {
      var last = currentTheme();
      new MutationObserver(function () {
        var now = currentTheme();
        if (now !== last) {
          last = now;
          try { localStorage.setItem(KEY, now); } catch (e) { /* private mode */ }
          syncAllIcons();
        }
      }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    }

    document.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest('[data-mta-toggle],[data-mta-top]') : null;
      if (!t) return;
      if (t.hasAttribute('data-mta-toggle')) {
        applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
      }
      if (t.hasAttribute('data-mta-top')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
