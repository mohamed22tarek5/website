# Mohamed Tarek Abdelhady Portfolio

**Communication & Electronics Engineer — Hardware + Software + Web**

Live Site (primary): [mohamed-tarek-abdelhady.vercel.app](https://mohamed-tarek-abdelhady.vercel.app/)  
Mirror (same deployment): [website-mohamed.vercel.app](https://website-mohamed.vercel.app)

Static HTML + Vercel. PWA-enabled portfolio, engineering calculators, and agent-ready API.

---

## About Me

I am a **Communication & Electronics Engineer** who builds integrated hardware–software solutions. I work with Arduino, embedded systems, PCB design, and full-stack web technologies.

- **Name:** Mohamed Tarek Abdelhady
- **Title:** Communication & Electronics Engineer
- **Location:** Kafr el Sheikh, Egypt
- **Phone:** +20 109 063 7406
- **Email:** mohammed.tarek.abdelhady.ali@gmail.com

---

## Skills

| Skill | Level |
|-------|-------|
| Classic Control & PLC | 60% |
| Arduino | 95% |
| PCB Design | 85% |
| Embedded Systems | 58% |

## Services

| Service | Description |
|---------|-------------|
| Web Development | Responsive websites using HTML5, CSS3, JavaScript, and modern frameworks |
| Arduino Development | Arduino-based systems for IoT, automation, and embedded applications |
| PCB Design | Schematics and PCB layouts using KiCad and EAGLE |
| Embedded Systems | Embedded solutions using ESP, PIC, and ARM microcontrollers |
| Circuit Simulation | Circuit simulation using Proteus, TinkerCAD, and similar tools |
| IoT Solutions | Complete IoT systems including hardware, firmware, and cloud dashboards |

## Featured Projects

- **Custom PCB Design** — Optimized controller board with high signal integrity
- **Portfolio Website** — Fully responsive web portfolio + PWA
- **Circuit Simulation** — Multiple designs simulated in Proteus and TinkerCAD
- **Smart Blind Glasses** — Assistive navigation using ultrasonic sensors
- **Health Monitoring System** — IoT patient monitoring with real-time analytics
- **Smart Home System** — Full home automation with ESP32 and mobile control

## Achievements

| Metric | Count |
|--------|-------|
| Completed Projects | 200+ |
| Satisfied Clients | 50+ |
| Years Experience | 2+ |
| Certificates Earned | 13+ |

## Tools & Technologies

| Category | Tools |
|----------|-------|
| Web | HTML5, CSS3, JavaScript, frameworks |
| Embedded | Arduino, ESP, PIC, ARM |
| Design | KiCad, EAGLE, PCB layout |
| Simulation | Proteus, TinkerCAD |
| IoT | Cloud platforms, dashboards, mobile app control |

## Languages

- **Arabic** — Native
- **English** — Proficient

---

## Features

### 1. Portfolio Pages (`public/`)
- `index.html` — Main portfolio (dark theme, SEO + JSON-LD + Open Graph)
- `Mohamed - CV.html`, `Mohamed - Services.html`, `Mohamed - Project.html`, `Mohamed - Personal Information.html`, `Mohamed - social-media.html`, `Mohamed - Certificates.html`, `Mohamed - my-sites.html`
- `Mohamed_Tarek_Abdelhady_Engineer_CV.pdf` — Downloadable CV
- `photo.jpg`, `icon.png`, `manifest.webmanifest`, `sw.js`, `pwa.js`, `offline.html`

### 2. Engineering Tools (`public/sites/`)
Interactive calculators, converters, and games:

- Electrical: `electrical-calculation.html`, `ohms-law-calculator.html`, `Power-Factor-Calculator.html`, `Power-Triangle-Calculator.html`, `Transformer-Turns-Calculator.html`, `Wire-Gauge-Calculator.html`, `Battery-Capacity-&-Runtime-Calculator.html`, `buck-boost-calculator.html`, `RC-Filter-&-LC-Resonance-Calculator.html`, `voltage-divider-calculator.html`, `decibel-dbm-calculator.html`, `battery-solar-calculator.html`
- Electronics: `capacitor-calculator.html`, `Indactance-calculator.html`, `resistor-calculator.html`, `resistor-for-led.html`, `LCD-Custom-Character-Generator.html`, `555-timer-calculator.html`, `op-amp-gain-calculator.html`, `pcb-trace-width-calculator.html`
- Utilities: `Length-Converter.html`, `to-do-list.html`, `Medication-Reminder.html`, `Mastering Linux Commands.html`, `ai-sites-list.html`, `dashboard.html`
- Games: `3d-car-game.html`, `dino-game.html`, `Race-Game.html`

Shared PWA assets in `sites/`: `common.css`, `common.js`, `sw.js`, `pwa.js`, `manifest.webmanifest`, `offline.html`

### 3. Agent-Ready API (`api/` + `.well-known/`)
- `openapi.json` — Portfolio API spec (homepage + calculators + x402 premium)
- `api/markdown.js` — Content negotiation: `Accept: text/markdown` → Markdown version of any page (Cloudflare Markdown-for-Agents / llmstxt.org pattern). Responds `Content-Type: text/markdown; charset=utf-8` + `x-markdown-tokens`; HTML stays default. Sources: `public/*.md` + HTML→Markdown fallback
- `api/x402.js` — x402 payment-gated premium resource (Base Sepolia)
- `api/agent/*` — Agent identity + claim endpoints
- `api/oauth-*.js` — OAuth protected-resource + authorization-server discovery
- `.well-known/agent-card.json`, `acp.json`, `mcp/server-card.json`, `api-catalog/`, `ai-catalog.json`, `agent-skills/`, `ucp`, `x402`, `http-message-signatures-directory`, `jwks.json`
- `skills/engineering-calculators.md` — Skill definition for AI assistants (ohms-law, resistor-color-code, led-calculator)
- `dns-aid.zone` — DNS-AID discovery records (`_index`/`_a2a`/`_mcp` under `_agents`, SVCB/HTTPS + `key65280`/`key65281`, DNSSEC required). **Not yet live:** `*.vercel.app` DNS can't host them — apply at a custom domain's provider, then enable DNSSEC

### 4. PWA Support
- Offline support via `sw.js` service worker
- Installable on mobile and desktop via `manifest.webmanifest`
- Offline fallback: `offline.html`
- Icons: `icon.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

### 5. SEO / GEO / Meta
- Open Graph (Facebook, LinkedIn) + Twitter Card + JSON-LD (`Person` schema) on every page
- Semantic HTML5 + ARIA, mobile-first responsive
- `sitemap.xml`, `robots.txt` (AI-train blocks for GPTBot/CCBot/ClaudeBot, `Agentmap` + `Content-Signal` headers)
- `seo-config.json` — canonical URLs, locales (en/ar/de/fr), GEO target engines (ChatGPT, Claude, Perplexity, Gemini, Copilot)

---

## Project Structure

```
website/
├── public/                     # Vercel outputDirectory — deployed root
│   ├── index.html              # Main portfolio page
│   ├── Mohamed - *.html        # CV / Services / Projects / Info / Social / Certificates / Sites
│   ├── common.css / common.js  # Shared design system
│   ├── sw.js / pwa.js / manifest.webmanifest / offline.html
│   ├── sitemap.xml / robots.txt / openapi.json / auth.md
│   ├── index.md / projects.md / Mohamed - Services.md
│   ├── Project/ / Certificates/ # Static assets
│   ├── sites/                  # Engineering tools + games (see Features)
│   └── .well-known/            # Agent / MCP / ACP / UCP / OAuth discovery
├── api/                        # Vercel serverless functions
│   ├── markdown.js             # Accept: text/markdown negotiation
│   ├── x402.js                 # x402 payment endpoint
│   ├── agent/identity*.js
│   └── oauth-*.js
├── skills/
│   └── engineering-calculators.md
├── tools/                      # Windows utilities (M.T.A. Cleaner, Defender, Tweaking, info pc)
├── vercel.json                 # Headers, rewrites, functions config
├── seo-config.json
├── openapi.json                # Root copy (also served from public/)
├── html-to-markdown.js         # Shared HTML→MD converter
├── robots.txt / dns-aid.zone / .well-known/
└── README.md
```

---

## Getting Started

No build step — pure static + Vercel functions.

```bash
# 1. Preview locally (any static server)
npx serve public
# or
python -m http.server --directory public 8000

# 2. Test Markdown negotiation
curl -H "Accept: text/markdown" http://localhost:8000/
curl -H "Accept: text/markdown" http://localhost:8000/sites/ohms-law-calculator.html

# 3. Deploy
vercel --prod
```

Vercel config: `outputDirectory: public`, `api/markdown.js` includes `public/**`, rewrites map `Accept: text/markdown` page requests to `/api/markdown?path=...`.

---

## API Reference

| Endpoint | Description |
|----------|-------------|
| `GET /` | Portfolio homepage (HTML, or Markdown with `Accept: text/markdown`) |
| `GET /sites/:slug.html` | Engineering tool page (HTML or Markdown) |
| `GET /api/x402` | Premium resource — `402` + `PAYMENT-REQUIRED` header unless paid (x402 v1, Base Sepolia) |
| `GET /openapi.json` | OpenAPI 3.0.3 spec |
| `GET /.well-known/agent-card.json` | Agent Card discovery |
| `GET /.well-known/mcp/server-card.json` | MCP server card |
| `GET /.well-known/api-catalog/` | API catalog linkset |
| `GET /.well-known/ai-catalog.json` | AI catalog (ARD manifest) |

Full spec: [`openapi.json`](./openapi.json)

---

## PWA / SEO Notes

- Every page includes OG + Twitter Card + JSON-LD. Keep `og:image`, `canonical`, and `sitemap.xml` in sync when adding pages.
- `vercel.json` sets security headers (`X-Content-Type-Options`, `X-Frame-Options: SAMEORIGIN`, CSP `frame-ancestors 'self'`) and CORS `*` on all `.well-known/*`.
- `html-to-markdown.js` and `api/markdown.js` must stay in sync (converter is inlined in the function for zero-import bundling).

---

## Contact

**Phone:** +20 109 063 7406
**Email:** mohammed.tarek.abdelhady.ali@gmail.com
**Location:** Kafr elSheikh, Egypt

[LinkedIn](https://www.linkedin.com/in/mohamedtarek225) · [GitHub](https://github.com/mohamed22tarek5) · [Instagram](https://www.instagram.com/_m7md_tarek_/) · [WhatsApp](https://wa.me/+201090637406)

---

## License

© 2025–2026 Mohamed Tarek Abdelhady. All Rights Reserved.
