/**
 * middleware.js — Country → locale routing for HUMANS ONLY (Multilingual SEO, Part A).
 *
 * This is locale/country routing, NOT GEO. GEO = citations inside AI answers.
 * Never confuse the two (see docs/seo/GEO.md).
 *
 * Rules (non-negotiable):
 * - Unique URL per locale. Default locale (en) unprefixed; ar/de/fr/es prefixed.
 * - Resolve country server-side only via x-vercel-ip-country. Never trust client data.
 * - SKIP redirect when: locale already in path, ui_locale cookie set, or UA is a
 *   known crawler (search + AI + social preview bots). Crawlers NEVER get redirected.
 * - Humans get a 307 to the right locale URL. One job per page, no doorway tricks.
 */

const SUPPORTED = ["en", "ar", "de", "fr", "es"];
const DEFAULT_LOCALE = "en";

// Country → locale allowlist (server header only).
const COUNTRY_TO_LOCALE = {
  // Arabic
  EG: "ar", SA: "ar", AE: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar",
  JO: "ar", LB: "ar", IQ: "ar", SY: "ar", YE: "ar", SD: "ar", LY: "ar",
  TN: "ar", DZ: "ar", MA: "ar", MR: "ar",
  // German
  DE: "de", AT: "de", CH: "de", LI: "de",
  // French
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", CM: "fr",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
};

const CRAWLER_RE = /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|gptbot|oai-searchbot|chatgpt-user|claudebot|anthropic-ai|perplexitybot|google-extended|applebot|ccbot|bytespider|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp)/i;

const LOCALE_PREFIX_RE = /^\/(ar|de|fr|es)(\/|$)/;

const SKIP_PREFIXES = [
  "/api", "/_next", "/.well-known", "/sites", "/Project",
  "/sw.js", "/pwa.js", "/manifest.webmanifest", "/sitemap.xml",
  "/robots.txt", "/llms.txt", "/icon", "/apple-touch-icon", "/photo.jpg",
  "/CV.pdf", "/common.", "/offline.html",
];

export default function middleware(req) {
  const url = new URL(req.url);
  const { pathname, search } = url;

  // 1. Skip static/api/asset paths (one i18n job: locale homes only).
  for (const p of SKIP_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + ".")) {
      return undefined; // continue, no redirect
    }
  }

  // 2. Skip when locale already in path.
  if (LOCALE_PREFIX_RE.test(pathname)) return undefined;

  // 3. Skip when user already chose a language (cookie overrides country).
  const cookie = req.headers.get("cookie") || "";
  if (/(?:^|;\s*)ui_locale=(ar|de|fr|es|en)/.test(cookie)) return undefined;

  // 4. NEVER redirect crawlers (search + AI + social preview).
  const ua = req.headers.get("user-agent") || "";
  if (CRAWLER_RE.test(ua)) return undefined;

  // 5. Only redirect the homepage root (avoid hijacking deep EN links).
  if (pathname !== "/" && pathname !== "/index.html") return undefined;

  // 6. Server-side country only.
  const country = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const locale = COUNTRY_TO_LOCALE[country];
  if (!locale || locale === DEFAULT_LOCALE) return undefined;

  // 7. Human 307 to locale-prefixed URL.
  const dest = new URL(`/${locale}/`, url.origin);
  dest.search = search;
  return Response.redirect(dest.toString(), 307);
}

export const config = {
  matcher: ["/", "/index.html"],
};
