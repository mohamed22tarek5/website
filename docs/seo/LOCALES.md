# LOCALES.md — Multilingual SEO URL architecture (Part A)

Product: **Mohamed Tarek Portfolio** · Site: `https://website-mohamed.vercel.app`
Stack: Static HTML + Vercel (no Next.js; principles from the playbook adapted).

> Country/IP redirects serve the right language URL to **humans**. That is
> locale routing — it is **NOT** GEO. GEO = citations inside AI answers.
> Never call country redirects "GEO" in docs or code.

## 1. Rules (non-negotiable)
- One language per URL. Never serve two languages on the same URL.
- Default locale `en` is **unprefixed** (`/`). Others prefixed: `/ar/`, `/de/`, `/fr/`, `/es/`.
- Native commercial intent in locale paths (never reuse English slugs like `/de/pricing`).
- Canonical = absolute URL of THAT locale page.
- hreflang reciprocal on every locale page + `x-default` → EN root.
- Country resolved server-side only (`x-vercel-ip-country` in `middleware.js`).
- Skip country redirect when: locale already in path, `ui_locale` cookie set,
  or UA is a known crawler (Googlebot, Bingbot, GPTBot, OAI-SearchBot,
  ChatGPT-User, ClaudeBot, PerplexityBot, Applebot, social preview bots…).
- Humans get a `307`; crawlers NEVER get redirected.
- Cookie / switcher overrides country routing. No DB persistence (portfolio).
- `en-US` vs `en-GB` duplicates: NOT shipped (no truly unique content).
- Internal tool pathnames stay English (`/sites/ohms-law-calculator.html`);
  only public marketing paths localize via the map below.

## 2. Shipped pages
| Locale | URL | File | Notes |
|---|---|---|---|
| en (default) | `/` | `public/index.html` | Full portfolio + TL;DR + FAQ + hreflang + JSON-LD graph |
| ar (RTL) | `/ar/` | `public/ar/index.html` | `lang=ar dir=rtl`, native Arabic, Arabic FAQPage |
| de | `/de/` | `public/de/index.html` | Native German commercial phrasing |
| fr | `/fr/` | `public/fr/index.html` | Native French commercial phrasing |
| es | `/es/` | `public/es/index.html` | Native Spanish commercial phrasing |

## 3. Slug map (present + reserved future money pages)
Present: locale homes only. When adding money pages, use these native slugs
(do NOT ship English slugs under a prefix):

| EN concept | ar (`/ar/…`) | de (`/de/…`) | fr (`/fr/…`) | es (`/es/…`) |
|---|---|---|---|---|
| services | `/ar/khadamat` (خدمات) | `/de/leistungen` | `/fr/services` | `/es/servicios` |
| pcb-design | `/ar/tasmim-pcb` | `/de/platinenlayout` | `/fr/conception-pcb` | `/es/diseno-pcb` |
| arduino-dev | `/ar/tatwir-arduino` | `/de/arduino-entwicklung` | `/fr/developpement-arduino` | `/es/desarrollo-arduino` |
| iot-solutions | `/ar/hulul-iot` | `/de/iot-loesungen` | `/fr/solutions-iot` | `/es/soluciones-iot` |
| projects | `/ar/mashari` | `/de/projekte` | `/fr/projets` | `/es/proyectos` |
| contact | `/ar/ittasil` | `/de/kontakt` | `/fr/contact` | `/es/contacto` |

Latin transliteration for Arabic paths keeps URLs portable (spec-compliant).

## 4. Commercial phrases per locale (use in H1/title/FAQ, not calques)
- **ar (EG/MENA):** مهندس إلكترونيات، تصميم PCB، تطوير أردوينو، أنظمة مدمجة، إنترنت الأشياء، حاسبة قانون أوم
- **de (DACH):** Elektronikingenieur, PCB-Design / Platinenlayout, Arduino-Entwicklung, eingebettete Systeme, IoT-Lösungen, Ohmsches-Gesetz-Rechner
- **fr (FR/BE):** ingénieur électronique, conception PCB, développement Arduino, systèmes embarqués, solutions IoT, calculateur loi d'Ohm
- **es (ES/LatAm):** ingeniero electrónico, diseño PCB, desarrollo Arduino, sistemas embebidos, soluciones IoT, calculadora ley de Ohm
- **en (US/UK/EG-intl):** embedded systems engineer, PCB design services, Arduino development, IoT solutions, electronics engineer Egypt

## 5. Cannibalization — one job per page
- `/` = category + CTA (who he is + hire him).
- `/ar|de|fr|es/` = same job, other language (never compete with EN).
- `Mohamed - Services.html` = mechanism (what each service includes).
- `Mohamed - Project.html` = proof. Tools under `/sites/` = informational/utilitarian.
- Future compare/guides: one query cluster per page; cross-link, don't duplicate.

## 6. How to add a locale (e.g. `it`)
1. Add `it` to `SUPPORTED` in `middleware.js` + `public/locale-router.js`.
2. Extend `COUNTRY_TO_LOCALE` (IT, SM) and `config` matcher untouched (root only).
3. Copy `public/de/index.html` → `public/it/index.html`; translate natively
   (H1/title/FAQ/TL;DR), set `lang=it`, canonical `/it/`, add hreflang `it`
   to ALL locale pages + EN.
4. Add `public/sitemap.xml` `<url>` for `/it/` with full `xhtml:link` set.
5. Add `i18n/it.json` (same keys as `en.json`); run `node scripts/check-parity.js`.
6. Extend `llms.txt` generator + regenerate; update this doc + `GEO.md` prompts.
7. Verify: crawler UA stays on `/`; human IT IP 307s to `/it/`; RTL only if needed.

## 7. How to add a GEO page later (per locale)
Follow `docs/seo/GEO.md` §B3 formula: question H2 → 40–60 word answer →
fact/number → specifics → FAQ (3–7) + FAQPage JSON-LD + TL;DR + dates.
Localize intent natively; wire sitemap + llms.txt + ledger prompts.
