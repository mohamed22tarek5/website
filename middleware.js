/**
 * Routing Middleware — Markdown for Agents (content negotiation).
 *
 * Runs before routing and the cache on matched page routes. When the
 * client prefers `text/markdown` (e.g. `Accept: text/markdown`), the
 * request is internally rewritten to /api/markdown, which responds
 * with `Content-Type: text/markdown; charset=utf-8` plus
 * `x-markdown-tokens`. All other requests continue normally, so HTML
 * stays the default for browsers.
 *
 * Per https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 */
import { rewrite, next } from '@vercel/functions';

export const config = {
  matcher: ['/', '/index.html', '/sites/:slug.html', '/:slug.html'],
};

export default function middleware(request) {
  const accept = request.headers.get('accept') || '';
  if (!accept.toLowerCase().includes('text/markdown')) {
    return next();
  }

  const url = new URL(request.url);
  const pagePath = url.pathname === '/index.html' ? '/' : url.pathname;

  const dest = new URL('/api/markdown', url.origin);
  dest.searchParams.set('path', pagePath);
  return rewrite(dest);
}
