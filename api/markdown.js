/**
 * Markdown for Agents - Content Negotiation
 * Serves markdown versions of pages when Accept: text/markdown is requested.
 *
 * Per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * and https://llmstxt.org/
 *
 * Routing Middleware (see /middleware.js) rewrites page requests
 * carrying `Accept: text/markdown` here:
 *   GET / with Accept: text/markdown -> /api/markdown?path=/
 *   GET /index.html with Accept: text/markdown -> /api/markdown?path=/
 *   GET /:slug.html with Accept: text/markdown -> /api/markdown?path=/:slug.html
 *   GET /sites/:slug.html with Accept: text/markdown -> /api/markdown?path=/sites/:slug.html
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/* Self-contained HTML->Markdown (inlined so the function has zero
 * cross-directory imports that could break bundling). Keep in sync
 * with /html-to-markdown.js. */
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

/* Embedded homepage markdown — guarantees a useful text/markdown
 * response even if public/ files are not bundled with the function. */
const HOMEPAGE_MD = `# Mohamed Tarek - Portfolio

Electronics & Communication Engineering student passionate about embedded systems, PCB design, and full-stack development.

## Quick Links

- [CV](/CV.html) - Resume and qualifications
- [Projects](/projects.html) - Engineering projects portfolio
- [Services](/Mohamed%20-%20Services.html) - Available services and tools
- [Certificates](/certificates.html) - Professional certifications
- [Social Media](/social-media.html) - Contact and social links

## Engineering Tools

- [Ohm's Law Calculator](/sites/ohms-law-calculator.html)
- [Resistor Color Code Calculator](/sites/resistor-color-calculator.html)
- [LED Resistor Calculator](/sites/led-resistor-calculator.html)
- [Voltage Divider Calculator](/sites/voltage-divider-calculator.html)
- [Capacitor Code Calculator](/sites/capacitor-code-calculator.html)

## About

I'm a passionate engineering student focusing on:
- **Embedded Systems**: Arduino, ESP32, STM32
- **PCB Design**: KiCad, EasyEDA
- **Web Development**: HTML, CSS, JavaScript
- **Mobile Development**: Flutter

## Contact

- GitHub: [MohamedTarek20](https://github.com/MohamedTarek20)
- LinkedIn: [Mohamed Tarek](https://www.linkedin.com/in/mohamedtarek20)
`;

function normalizePath(raw) {
  if (!raw) return '/';
  let p = String(raw);
  // Strip query string / hash
  p = p.split('?')[0].split('#')[0];
  // URL-decode (handles %20 etc.), tolerate malformed input
  try {
    p = decodeURIComponent(p);
  } catch {
    // keep as-is
  }
  if (!p.startsWith('/')) p = '/' + p;
  // Map homepage variants to /index
  if (p === '/' || p === '/index' || p === '/index.html' || p === '/index.md') {
    return '/index';
  }
  // Strip trailing .html / .md for lookup (we try both extensions)
  p = p.replace(/\.html?$/i, '').replace(/\.md$/i, '');
  // Remove trailing slash (except root, already handled)
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function sendMarkdown(res, markdown) {
  const tokens = estimateTokens(markdown);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('x-markdown-tokens', String(tokens));
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).send(markdown);
}

export default function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');
    return res.status(200).end();
  }

  const accept = req.headers.accept || '';

  // Get path from query params (from rewrite) or URL
  // Vercel rewrite passes ?path=/ ; direct calls may use ?path=/sites/x.html
  // or /api/markdown/:path* style (req.query.path may be array).
  let rawPath = req.query && req.query.path;
  if (Array.isArray(rawPath)) rawPath = '/' + rawPath.join('/');
  if (!rawPath) {
    // Fall back to parsing URL: /api/markdown?path=X already handled;
    // /api/markdown/<subpath> style
    const urlPath = (req.url || '').split('?')[0];
    const m = urlPath.match(/^\/api\/markdown(\/.*)?$/);
    rawPath = (m && m[1]) || '/';
  }

  const wantsMarkdown = accept.includes('text/markdown');
  const hasExplicitPath =
    (req.query && typeof req.query.path !== 'undefined') ||
    (req.url && req.url.includes('path='));

  // If no explicit page requested and client doesn't want markdown,
  // return usage instructions (backwards compatible).
  if (!wantsMarkdown && !hasExplicitPath) {
    return res.status(200).json({
      message: 'Markdown for Agents is supported',
      usage: 'Set Accept: text/markdown header to get markdown version',
      example: 'curl -H "Accept: text/markdown" https://website-mohamed.vercel.app/'
    });
  }

  const normalized = normalizePath(rawPath);
  const publicDir = join(process.cwd(), 'public');

  // 1) Try pre-generated markdown: public/<normalized>.md
  //    e.g. /index -> public/index.md, /Mohamed - Services -> public/Mohamed - Services.md
  const candidates = [
    join(publicDir, `${normalized}.md`),
    join(publicDir, `${normalized}.MD`),
  ];

  for (const mdPath of candidates) {
    if (existsSync(mdPath)) {
      try {
        const content = readFileSync(mdPath, 'utf-8');
        return sendMarkdown(res, content);
      } catch {
        // fall through to HTML conversion
      }
    }
  }

  // 2) Convert HTML -> markdown: public/<normalized>.html
  const htmlCandidates = [
    join(publicDir, `${normalized}.html`),
    join(publicDir, `${normalized}.HTML`),
  ];

  for (const htmlPath of htmlCandidates) {
    if (existsSync(htmlPath)) {
      try {
        const html = readFileSync(htmlPath, 'utf-8');
        const md = htmlToMarkdown(html);
        if (md && md.trim().length > 0) {
          return sendMarkdown(res, md);
        }
      } catch {
        // fall through to fallback
      }
    }
  }

  // 3) Fallback: homepage gets embedded copy; other pages get a minimal
  // page so agents still receive text/markdown with HTTP 200.
  if (normalized === '/index') {
    return sendMarkdown(res, HOMEPAGE_MD);
  }
  const title = normalized
    .replace(/^\//, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Home';

  const siteBase = `https://${req.headers.host || 'website-mohamed.vercel.app'}`;
  const pageUrl = `${siteBase}${normalized === '/index' ? '/' : normalized}`;
  const fallbackMd = `# ${title}\n\nThis page is part of Mohamed Tarek's portfolio.\n\nVisit [${title}](${pageUrl}) for the full experience.\n`;

  return sendMarkdown(res, fallbackMd);
}
