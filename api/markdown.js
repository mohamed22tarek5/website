/**
 * Markdown for Agents - Content Negotiation
 * Serves markdown versions of pages when Accept: text/markdown is requested.
 *
 * Per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 * and https://llmstxt.org/
 *
 * Vercel rewrites (see vercel.json) route:
 *   GET / with Accept: text/markdown -> /api/markdown?path=/
 *   GET /index.html with Accept: text/markdown -> /api/markdown?path=/
 *   GET /:slug.html with Accept: text/markdown -> /api/markdown?path=/:slug.html
 *   GET /sites/:slug.html with Accept: text/markdown -> /api/markdown?path=/sites/:slug.html
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { htmlToMarkdown, estimateTokens } from '../html-to-markdown.js';

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

  // 3) Fallback: generate minimal markdown so agents still get text/markdown
  const title = normalized
    .replace(/^\//, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Home';

  const siteBase = `https://${req.headers.host || 'website-mohamed.vercel.app'}`;
  const pageUrl = `${siteBase}${normalized === '/index' ? '/' : normalized}`;
  const fallbackMd = `# ${title}\n\nThis page is part of Mohamed Tarek's portfolio.\n\nVisit [${title}](${pageUrl}) for the full experience.\n`;

  return sendMarkdown(res, fallbackMd);
}
