/**
 * Netlify Function: markdown
 * Port of api/markdown.js for dual-deploy (Vercel + Netlify).
 * Vercel stays on api/markdown.js; Netlify serves this via:
 *   /api/markdown -> /.netlify/functions/markdown
 *
 * Keep in sync with /api/markdown.js and /html-to-markdown.js.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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

const HOMEPAGE_MD = `# Mohamed Tarek Abdelhady — Communication Engineer

Communication & Electronics Engineer building integrated hardware–software solutions with Arduino, embedded systems, PCB design, and full-stack web technologies.

Live site: https://mohamed-tarek-abdelhady.vercel.app/
Mirror: https://eng-mta.netlify.app/

## Pages

- [Home](/) — Portfolio homepage
- [CV](/cv.html) — Resume and qualifications
- [Projects](/projects.html) — Engineering projects portfolio
- [Services](/services.html) — Available services and tools
- [Certificates](/certificates.html) — Professional certifications
- [Social Media](/social-media.html) — Contact and social links
- [Apps & Tools](/tools.html) — All engineering tools

## Engineering Tools

- [Ohm's Law Calculator](/sites/ohms-law-calculator.html)
- [Resistor Calculator](/sites/resistor-calculator.html)
- [Resistor for LED](/sites/resistor-for-led.html)
- [Voltage Divider Calculator](/sites/voltage-divider-calculator.html)
- [Capacitor Calculator](/sites/capacitor-calculator.html)
- [555 Timer Calculator](/sites/555-timer-calculator.html)
- [PCB Trace Width Calculator](/sites/pcb-trace-width-calculator.html)
- [dB / dBm Calculator](/sites/decibel-dbm-calculator.html)
- [Op-Amp Gain Calculator](/sites/op-amp-gain-calculator.html)
- [Battery Life & Solar Calculator](/sites/battery-solar-calculator.html)

## About

- **Skills**: Arduino (95%), PCB Design (85%), Classic Control & PLC (60%), Embedded Systems (58%)
- **Location**: Kafr el Sheikh, Egypt

## Contact

- **Email**: mohammed.tarek.abdelhady.ali@gmail.com
- **Phone**: +20 109 063 7406
- **LinkedIn**: https://www.linkedin.com/in/mohamedtarek225
- **GitHub**: https://github.com/mohamed22tarek5
- **Instagram**: https://www.instagram.com/_m7md_tarek_/
- **WhatsApp**: https://wa.me/+201090637406
`;

function normalizePath(raw) {
  if (!raw) return '/';
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

function getHost(req, url) {
  return (
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    url.host ||
    'eng-mta.netlify.app'
  );
}

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Accept, Content-Type',
      },
    });
  }

  const url = new URL(req.url);
  const accept = req.headers.get('accept') || '';

  // ?path=/ (from rewrites) or /api/markdown/<subpath> style
  let rawPath = url.searchParams.get('path');
  if (!rawPath) {
    const m = url.pathname.match(/^\/(?:api\/markdown|\.netlify\/functions\/markdown)(\/.*)?$/);
    rawPath = (m && m[1]) || '/';
  }

  const wantsMarkdown = accept.includes('text/markdown');
  const hasExplicitPath = url.searchParams.has('path') || (rawPath && rawPath !== '/');

  if (!wantsMarkdown && !hasExplicitPath) {
    return new Response(
      JSON.stringify({
        message: 'Markdown for Agents is supported',
        usage: 'Set Accept: text/markdown header to get markdown version',
        example: 'curl -H "Accept: text/markdown" https://eng-mta.netlify.app/',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const normalized = normalizePath(rawPath);
  const publicDir = join(process.cwd(), 'public');

  const sendMarkdown = (markdown) =>
    new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': String(estimateTokens(markdown)),
        Vary: 'Accept',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
      },
    });

  for (const name of [`${normalized}.md`, `${normalized}.MD`]) {
    const mdPath = join(publicDir, name);
    if (existsSync(mdPath)) {
      try {
        return sendMarkdown(readFileSync(mdPath, 'utf-8'));
      } catch {
        // fall through
      }
    }
  }

  for (const name of [`${normalized}.html`, `${normalized}.HTML`]) {
    const htmlPath = join(publicDir, name);
    if (existsSync(htmlPath)) {
      try {
        const md = htmlToMarkdown(readFileSync(htmlPath, 'utf-8'));
        if (md && md.trim().length > 0) return sendMarkdown(md);
      } catch {
        // fall through
      }
    }
  }

  if (normalized === '/index') return sendMarkdown(HOMEPAGE_MD);

  const title =
    normalized.replace(/^\//, '').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
    'Home';
  const host = getHost(req, url);
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '') || 'https';
  const pageUrl = `${proto}://${host}${normalized === '/index' ? '/' : normalized}`;
  return sendMarkdown(
    `# ${title}\n\nThis page is part of Mohamed Tarek Abdelhady's portfolio.\n\nVisit [${title}](${pageUrl}) for the full experience.\n`
  );
};
