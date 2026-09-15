/* ============================================================
   locale-router.js — client-side locale fallback + preference cookie.
   Server (middleware.js) is authoritative for country; this file only
   handles navigator.language fallback + remembers the switcher choice.
   Country redirects are for humans, NOT GEO. Crawlers are never touched.
   ============================================================ */
(() => {
  'use strict';

  var SUPPORTED = ['en', 'ar', 'de', 'fr', 'es'];
  var COOKIE = 'ui_locale';
  var COOKIE_DAYS = 365;

  var CRAWLER_RE = /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|gptbot|oai-searchbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|google-extended|applebot|ccbot|bytespider|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp)/i;

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function setCookie(name, value) {
    var d = new Date();
    d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  function currentLocaleFromPath() {
    var m = window.location.pathname.match(/^\/(ar|de|fr|es)(\/|$)/);
    return m ? m[1] : 'en';
  }

  function browserLocale() {
    var lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    var base = lang.split('-')[0];
    return SUPPORTED.indexOf(base) !== -1 ? base : null;
  }

  function isCrawler() {
    return CRAWLER_RE.test(navigator.userAgent || '');
  }

  // Remember explicit switcher choice (cookie overrides country routing).
  function bindSwitcher() {
    var sw = document.getElementById('localeSwitcher');
    if (!sw) return;
    sw.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[hreflang]') : null;
      if (!a) return;
      var loc = (a.getAttribute('hreflang') || '').toLowerCase();
      if (SUPPORTED.indexOf(loc) !== -1) setCookie(COOKIE, loc);
    });
    // Mark current locale for AT + crawlers.
    var cur = currentLocaleFromPath();
    sw.querySelectorAll('a[hreflang]').forEach(function (a) {
      if ((a.getAttribute('hreflang') || '').toLowerCase() === cur) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  // One-time client fallback: only on bare EN root, no cookie, not a crawler.
  // Uses navigator.language ONLY (never client geo-IP for country/currency).
  function maybeRedirect() {
    try {
      if (isCrawler()) return;
      if (getCookie(COOKIE)) return;
      var path = window.location.pathname;
      if (path !== '/' && path !== '/index.html') return;
      if (currentLocaleFromPath() !== 'en') return;
      var bl = browserLocale();
      if (!bl || bl === 'en') return;
      setCookie(COOKIE, bl); // remember so we ask only once
      window.location.replace('/' + bl + '/');
    } catch (err) { /* never break the page for locale routing */ }
  }

  // Expose minimal API for future pages (one helper, no copies).
  window.LocaleRouter = {
    get: currentLocaleFromPath,
    set: function (locale) {
      if (SUPPORTED.indexOf(locale) === -1) return;
      setCookie(COOKIE, locale);
      window.location.href = locale === 'en' ? '/' : '/' + locale + '/';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bindSwitcher(); maybeRedirect(); });
  } else {
    bindSwitcher(); maybeRedirect();
  }
})();
