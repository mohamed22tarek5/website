/**
 * Markdown for Agents - Content Negotiation
 * Serves markdown versions of pages when Accept: text/markdown is requested.
 *
 * Per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * and https://isitagentready.com/.well-known/agent-skills/markdown-negotiation/SKILL.md
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/* Self-contained HTML->Markdown converter */
function htmlToMarkdown(html) {
  let md = String(html || '');
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  md = md.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  md = md.replace(/<header[\s\S]*?<\/header>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, c) => '\n' + String(c).split('\n').map((l) => '> ' + l.trim()).join('\n') + '\n');
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (m, c) => '\n' + String(c).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n'));
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (m, c) => {
    let i = 0;
    return '\n' + String(c).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => `${++i}. $1\n`);
  });
  md = md.replace(/<br[^>]*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1');
  md = md.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  md = md.replace(/<[^>]*>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}

function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 4);
}

const EMBEDDED_PAGES = {
  '/index': `# Mohamed Tarek Abdelhady — Communication Engineer

Communication & Electronics Engineer building integrated hardware–software solutions with Arduino, embedded systems, PCB design, and full-stack web technologies.

Live site: https://mohamed-tarek-abdelhady.vercel.app/
Mirrors: https://website-mohamed.vercel.app/ | https://eng-mta.netlify.app/

## Pages
- [Home](/) — Portfolio homepage
- [About](/about.html) — Personal information, engineering skills, and affiliations
- [CV](/cv.html) — Resume and technical competencies
- [Projects](/projects.html) — Engineering projects portfolio
- [Services](/services.html) — Available services and tools
- [Certificates](/certificates.html) — Professional certifications
- [Social Media](/social-media.html) — Contact and social links
- [Apps & Tools](/tools.html) — All engineering tools

## Engineering Calculators
- [Ohm's Law Calculator](/sites/ohms-law-calculator.html) — V=IR, P=VI
- [Resistor Calculator](/sites/resistor-calculator.html) — Color codes and values
- [Resistor for LED](/sites/resistor-for-led.html) — LED current-limiting resistor
- [Voltage Divider Calculator](/sites/voltage-divider-calculator.html) — Vout, R1, R2 with load
- [Capacitor Calculator](/sites/capacitor-calculator.html)
- [555 Timer Calculator](/sites/555-timer-calculator.html) — Astable and monostable
- [PCB Trace Width Calculator](/sites/pcb-trace-width-calculator.html) — IPC-2221
- [dB / dBm Calculator](/sites/decibel-dbm-calculator.html)
- [Op-Amp Gain Calculator](/sites/op-amp-gain-calculator.html)
- [Battery Life & Solar Calculator](/sites/battery-solar-calculator.html)

## Contact
- Email: mohammed.tarek.abdelhady.ali@gmail.com
- Phone: +20 109 063 7406
- LinkedIn: https://www.linkedin.com/in/mohamedtarek225
- GitHub: https://github.com/mohamed22tarek5
`,
  '/about': `# Mohamed Tarek Abdelhady Ali — About

Communication & Embedded Systems Engineer based in Kafr el Sheikh, Egypt. Specializing in Arduino development, embedded systems, PCB design, IoT solutions, and hardware–software integration.

Live page: https://mohamed-tarek-abdelhady.vercel.app/about.html

## Technical Skills
- Arduino (95%), PCB Design (85%), Classic Control & PLC (60%), Embedded Systems (58%)
- KiCad, EasyEDA, Proteus, Multisim
- C, C++, Python, JavaScript (ES6+), HTML5, CSS3, REST APIs, JSON-LD

## Contact
- Email: mohammed.tarek.abdelhady.ali@gmail.com
- Phone: +20 109 063 7406
- LinkedIn: https://www.linkedin.com/in/mohamedtarek225
`,
  '/cv': `# Mohamed Tarek Abdelhady Ali — Curriculum Vitae

Communication & Embedded Systems Engineer.
PDF CV: https://mohamed-tarek-abdelhady.vercel.app/Mohamed_Tarek_Abdelhady_Engineer_CV.pdf

## Education
B.Sc. in Communication and Electronics Engineering, Faculty of Engineering.

## Core Competencies
- Microcontrollers: Arduino, ESP32, ESP8266, STM32
- Hardware Design: Schematic capture, PCB layout, Gerber generation
- Protocols: UART, SPI, I2C, Modbus, MQTT, HTTP
- Web & Software: Vanilla JS, REST APIs, PWAs, JSON-LD
`,
  '/services': `# Services — Mohamed Tarek Abdelhady

Engineering services and free calculation tools.

## Services
- PCB Design: KiCad, EasyEDA schematic capture and multi-layer layout
- Embedded Systems: Arduino, ESP32, STM32 firmware and IoT prototyping
- Web Development: Vanilla ES6+, responsive sites, PWAs
- Technical Consulting: Circuit analysis and electronics consulting
`,
  '/tools': `# Engineering Tools & Calculators — Mohamed Tarek Abdelhady

Collection of 11+ client-side electronics calculators.
Live suite: https://mohamed-tarek-abdelhady.vercel.app/tools.html
`
};

function normalizePath(raw) {
  if (!raw) return '/index';
  let p = String(raw);
  p = p.split('?')[0].split('#')[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    // keep as-is
  }
  if (!p.startsWith('/')) p = '/' + p;
  if (p === '/' || p === '/index' || p === '/index.html' || p === '/index.md') {
    return '/index';
  }
  p = p.replace(/\.html?$/i, '').replace(/\.md$/i, '');
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function sendMarkdown(res, markdown, isHead = false) {
  const tokens = estimateTokens(markdown);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('x-markdown-tokens', String(tokens));
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Expose-Headers', 'x-markdown-tokens, Content-Type');
  res.statusCode = 200;
  if (isHead) {
    return res.end();
  }
  return res.end(markdown);
}

export default function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
    res.statusCode = 200;
    return res.end();
  }

  const isHead = req.method === 'HEAD';
  const accept = req.headers.accept || '';

  let rawPath = req.query && req.query.path;
  if (Array.isArray(rawPath)) rawPath = '/' + rawPath.join('/');
  if (!rawPath) {
    const urlPath = (req.url || '').split('?')[0];
    const m = urlPath.match(/^\/api\/markdown(\/.*)?$/);
    rawPath = (m && m[1]) || '/index';
  }

  const wantsMarkdown = accept.includes('text/markdown');
  const hasExplicitPath =
    (req.query && typeof req.query.path !== 'undefined') ||
    (req.url && req.url.includes('path='));

  // If no explicit page requested and client doesn't want markdown, return guidance
  if (!wantsMarkdown && !hasExplicitPath && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      message: 'Markdown for Agents is supported on this site',
      protocol: 'https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/',
      usage: 'Send Accept: text/markdown header on any page URL to receive markdown',
      example: 'curl -H "Accept: text/markdown" https://mohamed-tarek-abdelhady.vercel.app/'
    }, null, 2));
  }

  const normalized = normalizePath(rawPath);
  const publicDir = join(process.cwd(), 'public');

  // 1) Try pre-generated markdown in public/<normalized>.md
  const mdCandidates = [
    join(publicDir, `${normalized}.md`),
    join(publicDir, `${normalized}.MD`),
    join(process.cwd(), `${normalized}.md`)
  ];

  for (const mdPath of mdCandidates) {
    if (existsSync(mdPath)) {
      try {
        const content = readFileSync(mdPath, 'utf-8');
        if (content && content.trim()) {
          return sendMarkdown(res, content, isHead);
        }
      } catch {
        // fall through
      }
    }
  }

  // 2) Try converting HTML in public/<normalized>.html
  const htmlCandidates = [
    join(publicDir, `${normalized}.html`),
    join(publicDir, `${normalized}.HTML`),
    join(process.cwd(), `${normalized}.html`)
  ];

  for (const htmlPath of htmlCandidates) {
    if (existsSync(htmlPath)) {
      try {
        const html = readFileSync(htmlPath, 'utf-8');
        const md = htmlToMarkdown(html);
        if (md && md.trim().length > 0) {
          return sendMarkdown(res, md, isHead);
        }
      } catch {
        // fall through
      }
    }
  }

  // 3) Try embedded static page fallbacks
  if (EMBEDDED_PAGES[normalized]) {
    return sendMarkdown(res, EMBEDDED_PAGES[normalized], isHead);
  }

  // 4) Clean dynamic fallback for any other route
  const title = normalized
    .replace(/^\//, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Home';

  const siteBase = `https://${req.headers.host || 'mohamed-tarek-abdelhady.vercel.app'}`;
  const pageUrl = `${siteBase}${normalized === '/index' ? '/' : normalized}`;
  const fallbackMd = `# ${title}\n\nEngineering portfolio resource by Mohamed Tarek Abdelhady.\n\nFull page: [${title}](${pageUrl})\n\nContact: mohammed.tarek.abdelhady.ali@gmail.com\n`;

  return sendMarkdown(res, fallbackMd, isHead);
}
